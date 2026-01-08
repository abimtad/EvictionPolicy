# Dad Joke Cache Service

Express backend with custom caches (LRU, LFU, FIFO), Redis fixed-window rate limiting, MongoDB metrics, and dad joke fetching from icanhazdadjoke.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment defaults:
   ```bash
   cp .env.example .env
   ```
   Adjust ports, Redis URL, and Mongo URI as needed.
3. Start server:
   ```bash
   npm run dev
   ```

## Endpoints

- `GET /jokes/:jokeId`
  - Pipeline: cache middleware → Redis fixed-window rate limiter → controller.
  - On cache hit: returns cached joke plus per-cache metadata.
  - On cache miss: fetches from origin, **waits ~30 seconds** to simulate delayed cache writes, saves into all caches in parallel, then returns data and metadata.
- `POST /reset`
  - Clears all caches, Mongo metrics, and Redis rate-limit counters.

## Architecture

- `src/cache/`: Custom O(1) caches using linked lists and hash maps.
- `src/middlewares/`: Cache check and Redis rate limiting.
- `src/controllers/`: Joke fetch flow and reset handler.
- `src/services/`: External joke fetch + Mongo metrics persistence.
- `src/models/RequestMetric.js`: Stores per-request metrics, cache totals, and rate-limit snapshot.
- `src/config/`: Env, Mongo, and Redis configuration.

## Notes

- Rate limiting uses `RATE_LIMIT_WINDOW_SECONDS` and `RATE_LIMIT_MAX_REQUESTS` from environment (defaults: 60s window, 5 requests).
- Metrics are stored per request; each record includes cache hit/miss, durations, evictions, and rate-limit status.
- Redis failures degrade gracefully (requests continue without limiting).
- Mongo database is created on first write.
