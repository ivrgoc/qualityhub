# QualityHub AI Service

AI-powered test generation service for QualityHub. Uses LLM providers (Anthropic Claude, OpenAI) to generate test cases, BDD scenarios, and coverage suggestions from requirements and feature descriptions.

## Architecture

This service is a standalone FastAPI application that is consumed by the NestJS API gateway. The NestJS backend proxies authenticated requests to this service.

```
Browser -> NestJS API (auth, routing) -> AI Service (generation)
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/generate/tests` | Generate test cases (NestJS gateway path) |
| `POST` | `/generate/bdd` | Generate BDD scenarios (NestJS gateway path) |
| `POST` | `/api/v1/ai/generate-tests` | Generate test cases (direct access) |
| `POST` | `/api/v1/ai/generate-bdd` | Generate BDD scenarios (direct access) |
| `POST` | `/api/v1/ai/suggest-coverage` | Suggest coverage improvements |

## Setup

### Prerequisites

- Python 3.11+
- pip or a virtual environment manager

### Installation

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# For development (includes test and lint tools)
pip install -e ".[dev]"
```

### Configuration

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

Edit `.env` and set at least one of:
- `ANTHROPIC_API_KEY` - For Claude models (recommended)
- `OPENAI_API_KEY` - For GPT models

If no API keys are configured, the service operates in mock mode and returns placeholder test data.

### Running

```bash
# Development with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
```

### Docker

```bash
# Build
docker build -t qualityhub-ai-service .

# Run
docker run -p 8000:8000 \
  -e ANTHROPIC_API_KEY=your-key-here \
  qualityhub-ai-service
```

## API Documentation

When the service is running, interactive API documentation is available at:

- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## Development

### Running Tests

```bash
# Run all tests with coverage
pytest

# Run specific test file
pytest tests/test_services.py

# Run with verbose output
pytest -v
```

### Code Quality

```bash
# Lint
ruff check app/ tests/

# Format
ruff format app/ tests/

# Type check
mypy app/
```

### Project Structure

```
apps/ai-service/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py           # Dependency injection providers
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── base.py       # /api/v1/ai/* routes
│   │       └── generate.py   # /generate/* routes (NestJS gateway)
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py         # Settings (env vars)
│   │   └── security.py       # API key validation
│   ├── models/
│   │   ├── __init__.py
│   │   ├── requests.py       # Pydantic request models
│   │   └── responses.py      # Pydantic response models
│   ├── prompts/
│   │   ├── __init__.py
│   │   ├── test_generation.py  # Test generation prompts
│   │   └── bdd_generation.py   # BDD generation prompts
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── generation.py     # Internal schemas (LLM, config)
│   └── services/
│       ├── __init__.py
│       ├── llm_client.py     # LLM abstraction (OpenAI/Anthropic)
│       ├── test_generator.py # Test case generation logic
│       └── bdd_generator.py  # BDD scenario generation logic
├── tests/
│   ├── conftest.py
│   ├── test_api.py
│   ├── test_config.py
│   ├── test_generate_routes.py
│   ├── test_llm_client.py
│   ├── test_prompts.py
│   ├── test_schemas.py
│   ├── test_security.py
│   └── test_services.py
├── Dockerfile
├── requirements.txt
├── pyproject.toml
├── .env.example
└── README.md
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | QualityHub AI Service | Application name |
| `APP_VERSION` | 0.1.0 | Application version |
| `DEBUG` | false | Enable debug mode |
| `ENVIRONMENT` | development | Environment (development/staging/production) |
| `LOG_LEVEL` | INFO | Logging level |
| `HOST` | 0.0.0.0 | Server bind host |
| `PORT` | 8000 | Server bind port |
| `API_PREFIX` | /api/v1 | API route prefix |
| `CORS_ORIGINS` | localhost:3000,5173 | Allowed CORS origins |
| `OPENAI_API_KEY` | - | OpenAI API key |
| `ANTHROPIC_API_KEY` | - | Anthropic API key |
| `DEFAULT_AI_PROVIDER` | anthropic | Default LLM provider |
| `OPENAI_MODEL` | gpt-4o | OpenAI model |
| `ANTHROPIC_MODEL` | claude-sonnet-4-20250514 | Anthropic model |
| `API_KEYS` | [] | Service API keys for authentication |
