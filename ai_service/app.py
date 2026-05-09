"""
EcoNeighbour AI Service — application factory.
"""

from __future__ import annotations

import logging
import logging.config

import ollama

from fastapi import FastAPI

import config
from routers.invoice import router as invoice_router

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
LOGGING_CONFIG: dict = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
            "datefmt": "%Y-%m-%dT%H:%M:%S",
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
        }
    },
    "root": {"handlers": ["console"], "level": "INFO"},
}

logging.config.dictConfig(LOGGING_CONFIG)


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------

def create_app() -> FastAPI:
    app = FastAPI(
        title="EcoNeighbour AI Service",
        version="0.1.0",
        description=(
            "AI-powered utility invoice parser. "
            "Extracts consumption value, address data, and billing period "
            "from invoice images using **qwen2.5:2b** via Ollama."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
    )

    @app.on_event("startup")
    def ensure_ollama_model() -> None:
        logger = logging.getLogger(__name__)
        try:
            client = ollama.Client(host=config.OLLAMA_BASE_URL)
            logger.info("Ensuring Ollama model '%s' is available", config.OLLAMA_MODEL)
            client.pull(config.OLLAMA_MODEL)
        except Exception as exc:
            logger.exception("Ollama startup check failed: %s", exc)
            raise RuntimeError(
                "Ollama is not reachable or the model could not be pulled."
            ) from exc

    # ── Health check ───────────────────────────────────────────────────────
    @app.get("/health", tags=["System"], summary="Health check")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    # ── Routers ────────────────────────────────────────────────────────────
    app.include_router(invoice_router)

    return app


app = create_app()
