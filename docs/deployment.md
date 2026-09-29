# Deployment Guide

This guide details how to run the Devfolio OS stack using Docker Compose. The stack includes the frontend, backend, PostgreSQL database, Redis broker, and Celery worker.

## Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Running the Stack

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd devfolio-os
   ```

2. **Environment Variables**:
   Ensure you have the required `.env` variables set for both the frontend and backend. 
   - Backend requires `DATABASE_URL`, `REDIS_URL`, etc.
   - Frontend requires `NEXT_PUBLIC_API_URL`.

3. **Start the containers**:
   From the root of the project, run:
   ```bash
   docker-compose up --build -d
   ```
   The `-d` flag runs the containers in detached mode (in the background).

4. **Verify the services**:
   - **Frontend**: Accessible at [http://localhost:3000](http://localhost:3000)
   - **Backend API**: Accessible at [http://localhost:8000](http://localhost:8000)
   - **Swagger UI**: Accessible at [http://localhost:8000/docs](http://localhost:8000/docs)

## Services Included in `docker-compose.yml`

- **`frontend`**: Next.js application served on port 3000.
- **`backend`**: FastAPI application served on port 8000.
- **`celery_worker`**: Celery worker instance for processing background tasks.
- **`db` (Postgres)**: PostgreSQL database used by the backend.
- **`redis`**: Redis instance used as a message broker for Celery and caching.

## Managing the Stack

- **View logs**:
  ```bash
  docker-compose logs -f
  ```
  To view logs for a specific service (e.g., the backend):
  ```bash
  docker-compose logs -f backend
  ```

- **Stop the stack**:
  ```bash
  docker-compose down
  ```
  If you also want to remove volumes (WARNING: this will erase your database data):
  ```bash
  docker-compose down -v
  ```
