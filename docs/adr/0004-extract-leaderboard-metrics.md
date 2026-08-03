# 4. Extract Leaderboard Metrics

Status: Accepted
Date: 2026-08-04

## Context
The application features global and friends-only leaderboards. Originally, the architecture proposed fetching the derived metrics directly from the JSONB cache inside `CONNECTED_ACCOUNTS` or `PLATFORM_STATS_HISTORY`.

## Problem
Sorting and filtering a leaderboard across potentially thousands of users by parsing JSONB columns in real-time is highly inefficient and prevents proper indexing. 

## Decision
We will extract core, quantifiable metrics (e.g., `total_problems_solved`, `current_streak`, `developer_score`) into a normalized `USER_METRICS` table. 

## Alternatives Considered
- Materialized Views: Rejected because materialized views require periodic refreshing which can lead to stale data or lock contention, whereas updating a targeted row on sync is more precise.

## Trade-offs
- Celery workers now have an extra step: after parsing the raw JSON from platforms, they must compute the final scores and update the `USER_METRICS` table explicitly.

## Consequences
- Leaderboard queries become standard, lightning-fast indexed SQL queries (`ORDER BY developer_score DESC`).
- The API layer doesn't need to do any on-the-fly math.
