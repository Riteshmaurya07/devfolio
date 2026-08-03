# 1. Normalize AI Chat Messages

Status: Accepted
Date: 2026-08-04

## Context
The original architecture stored AI chat history as a JSONB array of messages inside the `AI_CHATS` table. While this is easy to implement initially, it does not scale.

## Problem
Storing an unbounded array of messages in a single JSONB column limits our ability to query specific messages, support infinite scrolling/pagination, handle real-time streaming effectively, and creates huge rows as conversations grow.

## Decision
We will normalize the chat storage into two tables: `AI_CHATS` (representing the conversation session) and `AI_MESSAGES` (representing individual messages). 

## Alternatives Considered
- Keep JSONB: Rejected due to scaling and querying issues.
- NoSQL Database (MongoDB/DynamoDB): Rejected to keep infrastructure simple and leverage PostgreSQL's robust relational features.

## Trade-offs
- Increased complexity in queries (requires JOINs).
- More database inserts per conversation.

## Consequences
- We can now easily paginate chat histories.
- Streaming responses can be updated incrementally per message row.
- Analytics on message counts and token usage becomes trivial.
