# Devfolio OS Backend

This is the backend service for Devfolio OS, built with FastAPI using Domain-Driven Design (DDD) principles.

## Tech Stack
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Database**: PostgreSQL with [SQLAlchemy](https://www.sqlalchemy.org/) ORM
- **Background Tasks**: [Celery](https://docs.celeryq.dev/en/stable/)
- **Caching/Broker**: Redis

## Architecture

The project follows a Domain-Driven Design (DDD) structure to keep business logic decoupled from the delivery mechanism and data access layers.

- `app/domain`: Contains core business logic, entities, and domain interfaces.
- `app/application`: Contains use cases and application services.
- `app/infrastructure`: Contains database repositories, external API integrations, and the Celery worker setup.
- `app/api`: Contains FastAPI routers, controllers, and dependency injections.

## Setup & Local Development

1. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. Environment Variables:
   Set up your `.env` file with necessary variables:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/devfolio
   REDIS_URL=redis://localhost:6379/0
   SECRET_KEY=your_secret_key
   ```

3. Database Setup:
   Run Alembic migrations to set up the database schema:
   ```bash
   alembic upgrade head
   ```

4. Run the API server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. Run Celery Worker (for background tasks):
   ```bash
   celery -A app.infrastructure.celery.worker worker --loglevel=info
   ```

## Background Tasks

Celery is used for asynchronous tasks such as email sending, report generation, and data synchronization. Ensure Redis is running as it serves as the message broker.
