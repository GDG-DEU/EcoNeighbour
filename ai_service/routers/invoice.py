"""
FastAPI router for invoice parsing endpoints.

POST /api/v1/invoice/parse
    Accepts a multipart image upload and returns the extracted invoice data.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

import config
from schemas.invoice import InvoiceParseResponse
from services.invoice_parser import parse_invoice

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/invoice", tags=["Invoice"])

# Accepted MIME types for invoice images
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/tiff",
    "image/bmp",
}

# Maximum upload size: 10 MB
MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post(
    "/parse",
    response_model=InvoiceParseResponse,
    status_code=status.HTTP_200_OK,
    summary="Parse a utility invoice image",
    description=(
        "Upload a utility bill image (JPEG, PNG, WebP, TIFF, BMP). "
        f"The service sends the image to **{config.OLLAMA_MODEL}** via Ollama and returns "
        "the extracted `consumption_value`, `address_data`, and `billing_period`."
    ),
    responses={
        400: {"description": "Unsupported file type or empty file"},
        413: {"description": "File exceeds the 10 MB size limit"},
        502: {"description": "Ollama service is unavailable"},
    },
)
async def parse_invoice_endpoint(
    file: UploadFile = File(
        ...,
        description="Invoice image file (JPEG, PNG, WebP, TIFF, or BMP)",
    ),
) -> InvoiceParseResponse:
    """
    Invoice parsing pipeline:

    1. Validate the uploaded file (type & size).
    2. Read raw bytes.
    3. Forward to `invoice_parser.parse_invoice()` which calls ``config.OLLAMA_MODEL``.
    4. Return a structured JSON response.
    """
    # ── Validation ────────────────────────────────────────────────────────
    content_type = file.content_type or ""
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported file type '{content_type}'. "
                f"Accepted types: {', '.join(sorted(ALLOWED_CONTENT_TYPES))}"
            ),
        )

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size {len(image_bytes):,} bytes exceeds the 10 MB limit.",
        )

    # ── Parse ──────────────────────────────────────────────────────────────
    logger.info(
        "Parsing invoice: filename=%s size=%d content_type=%s",
        file.filename,
        len(image_bytes),
        content_type,
    )

    try:
        result = await parse_invoice(image_bytes, content_type)
    except RuntimeError as exc:
        logger.error("Invoice parsing failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    return result
