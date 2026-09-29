# API Guide

This document provides a brief overview of the Devfolio OS backend API. The backend is built with FastAPI, which automatically generates interactive API documentation.

## Exploring the API

The best way to explore the available endpoints, request schemas, and response formats is through the automatically generated Swagger UI.

1. Ensure the backend server is running locally (either directly or via Docker).
2. Navigate to [http://localhost:8000/docs](http://localhost:8000/docs) in your browser.

Alternatively, you can view the ReDoc documentation at [http://localhost:8000/redoc](http://localhost:8000/redoc).

## Main Domains

The API is structured around several core business domains following DDD principles:

### 1. Users & Authentication
- **Endpoints**: `/api/v1/auth`, `/api/v1/users`
- **Responsibilities**: Handles user registration, JWT-based login, token refresh, password management, and user profile management. This includes managing profile data and handling avatar image uploads.

### 2. Platforms & Integrations
- **Endpoints**: `/api/v1/platforms`
- **Responsibilities**: Manages integrations with external coding and development platforms (e.g., GitHub, LeetCode, Codeforces). It handles linking external profiles to a user's Devfolio account and fetching statistics.

### 3. Leaderboard
- **Endpoints**: `/api/v1/leaderboards`
- **Responsibilities**: Provides aggregated ranking data based on users' performance metrics across linked platforms. Supports filtering, sorting, and pagination for competitive features.

### 4. AI Insights
- **Endpoints**: `/api/v1/ai`
- **Responsibilities**: Integrates with LLM services (e.g., Google Gemini) to provide automated code reviews, portfolio summaries, and personalized learning recommendations based on the user's aggregated data.

## Authentication

Most endpoints (except registration, login, and public read-only endpoints) require authentication. The API uses standard OAuth2 with Bearer tokens (JWT).

In the Swagger UI, click the **"Authorize"** button at the top right, enter your token (or use the login endpoint directly in the UI to automatically populate the token), and you will be able to interact with protected endpoints.
