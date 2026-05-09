"""
Pydantic schemas for invoice parsing request/response models.
"""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field


class InvoiceParseResponse(BaseModel):
    """Structured output returned by the invoice parsing pipeline."""

    consumption_value: Optional[float] = Field(
        default=None,
        description="Energy consumption in kWh (electricity) or m³ (gas). "
        "None if not found in the image.",
    )
    address_data: Optional[str] = Field(
        default=None,
        description="Full address extracted from the invoice, used to identify "
        "the neighborhood or district.",
    )
    billing_period: Optional[str] = Field(
        default=None,
        description="Billing period in 'Month/Year' format (e.g. '03/2025'). "
        "None if not found.",
    )
    energy_kwh: Optional[float] = Field(
        default=None,
        description="Energy consumed by the LLM call in kWh (from CodeCarbon).",
    )
    emissions_kgco2e: Optional[float] = Field(
        default=None,
        description="Estimated CO2 emissions from the LLM call in kgCO2e (from CodeCarbon).",
    )
    raw_text: Optional[str] = Field(
        default=None,
        description="Raw text extracted by the model before JSON parsing "
        "(useful for debugging).",
        exclude=True,  # excluded from API response by default
    )


class InvoiceParseError(BaseModel):
    """Returned when the pipeline fails to process the image."""

    detail: str
    raw_model_output: Optional[str] = None
