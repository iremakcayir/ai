# AI API Service

FastAPI application that exposes persona configuration data and health checks for the AI monorepo.

## Development

```bash
poetry install
poetry run uvicorn app.main:app --reload
```

The service uses settings loaded from environment variables. Copy `.env.example` to `.env` for local development.
