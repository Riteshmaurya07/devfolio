# 3. Resume Versioning Strategy

Status: Accepted
Date: 2026-08-04

## Context
The original architecture had a single `RESUMES` table containing `resume_data` as JSONB.

## Problem
The requirements specify that users should be able to support multiple resumes and maintain a version history (autosaving and reverting changes). Updating a single row repeatedly destroys historical data.

## Decision
We will implement an append-only versioning strategy. The `RESUMES` table will act as a container (defining the resume's title and metadata), while a `RESUME_VERSIONS` table will store the actual JSONB `resume_data` snapshots with timestamps.

## Alternatives Considered
- JSONB array of versions in the same row: Rejected due to row size limits and performance issues.

## Trade-offs
- Higher storage requirements.
- Needs periodic cleanup or limits on the number of saved versions per resume.

## Consequences
- Users can safely revert to previous resume states.
- Autosave can write new versions without overwriting the last explicitly published version.
