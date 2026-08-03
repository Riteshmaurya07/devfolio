# 2. Normalize Roadmap Data

Status: Accepted
Date: 2026-08-04

## Context
The original architecture stored the generated AI career roadmaps as a single JSONB object containing week-by-week plans and individual tasks inside the `ROADMAPS` table.

## Problem
A core feature of the roadmap is tracking progress, checking off tasks, and editing the plan. Doing concurrent updates to nested JSONB arrays for task completion is prone to race conditions and makes querying progress (e.g., "how many tasks completed today?") inefficient.

## Decision
We will normalize the roadmap into three tables: `ROADMAPS` (the overall goal), `ROADMAP_WEEKS` (the weekly milestones), and `ROADMAP_TASKS` (individual actionable items with boolean completion statuses).

## Alternatives Considered
- JSONB with Optimistic Locking: Rejected as it doesn't solve the querying inefficiency for analytics.

## Trade-offs
- More complex CRUD operations.
- Initial generation from the AI must be parsed and batch-inserted into multiple tables.

## Consequences
- Task completion is a simple boolean toggle on a specific row.
- Progress calculations can be done via SQL aggregation.
- Future features like task reordering or due dates can be added seamlessly.
