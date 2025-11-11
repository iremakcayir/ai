# AI Monorepo

This repository is organised as a pnpm-powered monorepo that groups together a Next.js web client, a FastAPI backend service, and a shared persona configuration package.

## Structure

```
apps/
  web/                # Next.js + TypeScript + Tailwind CSS app using Zustand for state management
services/
  api/                # FastAPI service managed via Poetry
packages/
  persona-config/     # Shared persona registry and TypeScript types
```

## Getting Started

### Prerequisites

* Node.js 18+
* pnpm 8+
* Python 3.11+
* Poetry 1.6+

### Install dependencies

```bash
pnpm install          # installs JS dependencies defined in the workspace
(cd services/api && poetry install)
```

### Running the web app

```bash
pnpm dev:web
```

The web app lives at `http://localhost:3000` and consumes personas defined in the shared package.

### Running the API

```bash
cd services/api
cp .env.example .env  # optional, update values as needed
poetry run uvicorn app.main:app --reload
```

The API exposes endpoints such as:

* `GET /health` – service health metadata
* `GET /personas` – list of available personas and defaults
* `GET /personas/{personaId}` – details for a single persona

## Shared Persona Package

`packages/persona-config` hosts the canonical persona registry in JSON alongside exported TypeScript helpers. Both the web client and any other consumer can import the module (`@ai/persona-config`) to stay in sync with the same data model.

Build artefacts can be generated with:

```bash
pnpm --filter @ai/persona-config build
```

## Tooling

* **pnpm workspace** ties together all JavaScript/TypeScript packages.
* **Tailwind CSS** drives the design system for the web client.
* **Zustand** powers lightweight state management in the Next.js app.
* **Poetry** manages Python dependencies for the FastAPI service.
