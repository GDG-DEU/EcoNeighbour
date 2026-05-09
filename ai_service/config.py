"""
Central configuration for the EcoNeighbour AI Service.
All tuneable values live here — no magic strings scattered across modules.
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Ollama
# ---------------------------------------------------------------------------

#: Base URL of the local Ollama server.
OLLAMA_BASE_URL: str = "http://localhost:11434"

#: Model used for invoice OCR / data extraction.
OLLAMA_MODEL: str = "qwen3.5:2b"

#: HTTP request timeout (seconds) for Ollama calls.
#: Cold-start model loading can be slow, so keep this generous.
OLLAMA_TIMEOUT: float = 120.0
