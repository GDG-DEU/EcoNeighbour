"""
Invoice parser service — calls Ollama via its HTTP API using the model
configured in ``config.OLLAMA_MODEL``, sends the invoice image as a
base64-encoded payload, and parses the structured JSON response into an
InvoiceParseResponse.
"""

from __future__ import annotations

import base64
import json
import logging
import re
from typing import Optional

import httpx
from codecarbon import EmissionsTracker

import config
from schemas.invoice import InvoiceParseResponse

logger = logging.getLogger(__name__)

# System prompt — instructs the model to act as an invoice OCR assistant.
SYSTEM_PROMPT = """You are an expert OCR assistant specialised in utility invoice parsing.
Your task is to analyse the provided invoice image and extract exactly three fields.

Return ONLY a valid JSON object with the following keys (no markdown, no explanation):
{
    "consumption_value": <number (float) or null>,
  "address_data": <string or null>,
  "billing_period": <string in MM/YYYY format or null>
}

Rules:
- consumption_value: numeric kWh (electricity) or m³ (gas) value. Omit units, return only the number as a float.
- If the value is a whole number, still include a decimal point (e.g. 120.0).
- address_data: the full address as printed on the invoice (street, city, postal code).
- billing_period: format as MM/YYYY (e.g. "03/2025"). If only a year is visible, use "01/<YEAR>".
- Use null for any field you cannot find.
- Do NOT add any text outside the JSON object.
"""

USER_PROMPT = "Extract the invoice data from the image above."


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _image_to_base64(image_bytes: bytes) -> str:
    """Encode raw image bytes to a base64 string."""
    return base64.b64encode(image_bytes).decode("utf-8")


def _extract_json(text: str) -> Optional[dict]:
    """
    Try to parse a JSON object from the model's raw text output.
    Handles cases where the model wraps the JSON in markdown fences.
    """
    # Strip markdown fences if present
    cleaned = re.sub(r"```(?:json)?", "", text, flags=re.IGNORECASE).strip()

    # Try direct parse first
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Fallback: extract the first {...} block
    match = re.search(r"\{.*?\}", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    return None


# ---------------------------------------------------------------------------
# Main service function
# ---------------------------------------------------------------------------

async def parse_invoice(image_bytes: bytes, content_type: str) -> InvoiceParseResponse:
    """
    Send the invoice image to the configured Ollama model and return structured data.

    Parameters
    ----------
    image_bytes : bytes
        Raw bytes of the uploaded invoice image.
    content_type : str
        MIME type of the image (e.g. "image/jpeg").

    Returns
    -------
    InvoiceParseResponse
        Parsed invoice fields. Fields may be None if not found.

    Raises
    ------
    RuntimeError
        If Ollama is unreachable or returns a non-200 status.
    """
    b64_image = _image_to_base64(image_bytes)

    tracker = EmissionsTracker(log_level="error")
    tracker.start()

    payload = {
        "model": config.OLLAMA_MODEL,
        "messages": [
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": USER_PROMPT,
                "images": [b64_image],
            },
        ],
        "stream": False,
        "format": "json",  # Ollama structured output hint
        "think": False,    # disable qwen3 thinking mode — final message only
        "options": {
            "temperature": 0.0,  # deterministic extraction
            "num_predict": 256,
        },
    }

    logger.info("Sending invoice image to Ollama model '%s'", config.OLLAMA_MODEL)

    try:
        async with httpx.AsyncClient(timeout=config.OLLAMA_TIMEOUT) as client:
            try:
                response = await client.post(
                    f"{config.OLLAMA_BASE_URL}/api/chat",
                    json=payload,
                )
            except httpx.ConnectError as exc:
                raise RuntimeError(
                    f"Cannot reach Ollama at {config.OLLAMA_BASE_URL}. "
                    "Make sure 'ollama serve' is running."
                ) from exc

            if response.status_code != 200:
                raise RuntimeError(
                    f"Ollama returned HTTP {response.status_code}: {response.text}"
                )
    finally:
        tracker.stop()
        emissions_data = tracker.final_emissions_data
        if emissions_data is not None:
            logger.info(
                "LLM energy usage: %.6f kWh, emissions: %.6f kgCO2e",
                emissions_data.energy_consumed,
                emissions_data.emissions,
            )

    logger.info("Ollama response: %s", response)
    data = response.json()
    logger.info("Raw model output:\n%s", data)
    raw_text: str = data.get("message", {}).get("content", "")
    logger.info("Raw model output:\n%s", raw_text)

    parsed = _extract_json(raw_text)

    if parsed is None:
        logger.warning("Could not parse JSON from model output: %s", raw_text)
        return InvoiceParseResponse(
            consumption_value=None,
            address_data=None,
            billing_period=None,
            raw_text=raw_text,
        )

    # Safely coerce consumption_value to float
    consumption_raw = parsed.get("consumption_value")
    try:
        consumption_value: Optional[float] = float(consumption_raw) if consumption_raw is not None else None
    except (ValueError, TypeError):
        consumption_value = None

    return InvoiceParseResponse(
        consumption_value=consumption_value,
        address_data=parsed.get("address_data"),
        billing_period=parsed.get("billing_period"),
        raw_text=raw_text,
    )
