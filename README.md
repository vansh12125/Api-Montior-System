# API Monitor — Backend

A backend system for collecting, processing, storing, and analyzing API request metrics from different applications.

API Monitor helps developers understand how their APIs are performing by tracking request counts, response times, errors, and endpoint usage.

Instead of manually checking logs from different applications, developers can send API metrics to a central backend and analyze the collected data through analytics APIs.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Why This Project?](#why-this-project)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [API Usage](#api-usage)
- [Analytics and Dashboard](#analytics-and-dashboard)
- [CSV Export](#csv-export)
- [Rate Limiting](#rate-limiting)
- [Database Design](#database-design)
- [Error Handling](#error-handling)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)

---

## About the Project

API Monitor is a backend application designed to monitor API traffic from multiple client applications.

A client application sends request information to the API Monitor ingestion endpoint. The backend validates the request, verifies the API key, and sends the event to RabbitMQ for asynchronous processing.

A background consumer processes these events and stores the appropriate information in MongoDB and PostgreSQL.

The analytics APIs then use the stored information to provide summaries, endpoint statistics, performance metrics, and CSV exports.

### Example

Suppose you have an application with these endpoints:

- `POST /auth/login`
- `GET /users`
- `POST /orders`
- `GET /products`

API Monitor can collect metrics such as:

- How many times each endpoint was called.
- How many requests returned errors.
- Average response time.
- Minimum and maximum response time.
- Which services and endpoints receive the most traffic.
- How API traffic changes over a selected date range.

The application being monitored can be written in any programming language, provided it can send HTTP requests with JSON data to the ingestion API.

**Note:** API Monitor does not automatically discover every endpoint in an external application. The application must instrument its requests or send metrics through an integration or SDK.

---

## Why This Project?

When an application grows, developers need a way to understand its API traffic and performance.

Without centralized monitoring, developers may have to inspect logs manually or build separate monitoring logic for each application.

API Monitor aims to provide a centralized solution by offering:

- One place to collect API metrics from multiple applications.
- Asynchronous event processing.
- Database-backed analytics.
- Client-specific data access.
- Date-filtered reports.
- Exportable CSV reports.
- Configurable request rate limits.

---

## Features

### 1. Authentication and Authorization

Provides authentication and access control for users of the monitoring platform.

Depending on the configured routes and authentication implementation, this includes:

- User authentication.
- Protected API routes.
- Client and user access control.
- Role-based authorization.
- Secure handling of authenticated requests.

### 2. Client Management

Organizes monitored applications under clients.

Each client can represent an application, project, or organization being monitored.

Client-specific data must remain isolated so that one client cannot access another client's metrics.

### 3. API Key Management

API keys allow external applications to submit monitoring events.

A key can be associated with a client and configured with permissions and restrictions such as:

- Ingestion permissions.
- Analytics permissions.
- Environment, such as development, staging, or production.
- Expiration.
- Allowed services.
- Optional IP or origin restrictions.

API keys should be treated as secrets and must not be exposed in public repositories or frontend code.

### 4. API Metrics Ingestion

The ingestion API receives monitoring events from client applications.

An event can contain information such as:

- Service name.
- Endpoint path.
- HTTP method.
- Response status.
- Request latency.
- Event timestamp.

The backend validates the API key and event payload before accepting the event.

### 5. Asynchronous Processing with RabbitMQ

RabbitMQ separates incoming requests from background processing.

This means the API does not need to perform every database operation before responding to an ingestion request.

The consumer reads events from a queue and processes them separately.

Benefits include:

- Reduced processing work in the request-response cycle.
- Buffering during temporary traffic spikes.
- Separation between ingestion and analytics processing.
- A foundation for retries and dead-letter handling.

A queue helps absorb bursts, but it does not provide unlimited capacity. Consumer throughput, queue size, database performance, and retry behavior still need to be monitored.

### 6. Metrics Storage

The project uses different databases for different purposes:

- **MongoDB:** stores detailed event records and application data where configured.
- **PostgreSQL:** stores aggregated endpoint metrics for efficient analytics queries.

This separation allows the system to retain detailed event information while querying summarized statistics efficiently.

### 7. Analytics APIs

Analytics endpoints can provide information such as:

- Total request count.
- Error request count.
- Error rate and success rate.
- Average latency.
- Number of unique services.
- Number of unique endpoints.
- Top endpoints by traffic.
- Metrics within a selected time range.

### 8. Dashboard Data API

The dashboard API combines multiple analytics results into one response.

For example, it can return:

- Summary statistics.
- Top endpoints.
- Time-bucketed metric records.
- The requested date range.

This helps the frontend load related dashboard information with one API request.

### 9. CSV Export

Users can export PostgreSQL metrics into a CSV file.

The export endpoint can accept:

- Start date.
- End date.
- Optional row limit.

The backend queries the authenticated client's matching records, converts the result to CSV, and sends it as a downloadable file.

For large exports, streaming should be used to avoid loading every row into server memory.

### 10. Rate Limiting

Express rate limiting helps prevent excessive requests.

Separate limits can be configured for normal API routes and ingestion routes.

For example, initial limits might be:

| Route group | Example limit |
|---|---:|
| Authentication, client, analytics | 100 requests/minute |
| Ingestion | 600 requests/minute |

These are example starting values, not guaranteed production capacity. Production ingestion should also have client-specific or API-key-specific quotas.

### 11. Logging and Error Handling

The backend uses centralized logging and consistent API error responses.

The error-handling design separates:

- Application errors.
- HTTP status codes.
- Standardized JSON responses.
- Internal error logging.

Sensitive information such as access tokens, API keys, passwords, and database credentials should never be written to logs.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | HTTP server and API routing |
| JavaScript ES Modules | Modular code organization |
| MongoDB | Document storage |
| Mongoose | MongoDB models and queries |
| PostgreSQL | Structured metrics and analytics |
| `pg` | PostgreSQL connectivity |
| RabbitMQ | Message queue |
| `amqplib` | RabbitMQ integration |
| JWT and bcrypt | Authentication-related functionality |
| Helmet | HTTP security headers |
| CORS | Cross-origin request configuration |
| express-rate-limit | Request rate limiting |
| Winston | Application logging |
| Docker | Containerized services |
| Docker Compose | Multi-container development environment |
| pgAdmin | PostgreSQL administration |

---

## Architecture

The backend follows a modular monolith design with a separate background consumer.

The API and its modules are organized within the same backend application. RabbitMQ enables asynchronous communication between ingestion and processing.


### Main Components

**API server**

Receives HTTP requests, authenticates users or API keys, validates input, and returns responses.

**RabbitMQ**

Stores pending messages until a consumer processes them.

**Background consumer**

Reads queued events, processes them, and writes the appropriate information to the databases.

**MongoDB**

Stores document-oriented application data and detailed event records where implemented.

**PostgreSQL**

Stores structured endpoint metrics used for analytics and reporting.

**Analytics API**

Reads aggregated metrics and returns reports to authorized users.

---

## How It Works

Consider a monitored application that receives a request to `GET /products`.

### Step 1: The monitored application receives a request

The application processes the request and measures its response time and status code.

### Step 2: The application sends a monitoring event

It sends an HTTP request to API Monitor with the required API key and JSON payload.

### Step 3: API Monitor validates the request

The ingestion endpoint verifies the API key, its permissions, and the event payload.

### Step 4: The event enters RabbitMQ

The backend publishes the validated event to the configured queue.

### Step 5: The consumer processes the event

The consumer reads the message, processes its fields, and stores the appropriate data.

### Step 6: Metrics are aggregated

PostgreSQL stores the endpoint statistics in time buckets, allowing requests to be grouped by client, service, endpoint, method, and time.

### Step 7: The dashboard requests analytics

The frontend sends a date-filtered request to the analytics API.

### Step 8: The backend returns results

The API returns the calculated statistics and matching metric records.

### Step 9: The user exports a report

The user can request a CSV export for the selected date range and optional row limit.

---

## Project Structure

The following is a simplified overview of the project's modules. Individual filenames may differ from your current repository.

```text
api-monitor-js-backend/
├── scripts/
│   └── init_postgresql.sql
├── src/
│   ├── configs/
│   │   ├── mongodb.js
│   │   ├── postgres.js
│   │   ├── rabbitmq.js
│   │   └── index.js
│   ├── constants/
│   │   └── index.js
│   ├── error/
│   │   └── ApiError.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Client.js
│   │   ├── ApiKey.js
│   │   └── ...
│   ├── services/
│   │   ├── auth/
│   │   ├── client/
│   │   ├── ingest/
│   │   └── analytics/
│   ├── utils/
│   │   ├── ResponseFormatter.js
│   │   └── ...
│   ├── app.js
│   └── server.js
├── docker-compose.yml
├── .env.example
├── .gitignore
└── package.json
```

### Folder Responsibilities

- `configs/`: database, message queue, and application configuration.
- `constants/`: centralized configuration and constants.
- `error/`: custom application error classes.
- `models/`: database models and schemas.
- `services/auth/`: authentication-related routes and logic.
- `services/client/`: client and API key management.
- `services/ingest/`: receiving and validating metric events.
- `services/analytics/`: querying and exporting metrics.
- `utils/`: reusable utilities such as response formatting.
- `scripts/`: database initialization scripts.
- `app.js`: Express application configuration and middleware.
- `server.js`: application startup and server initialization.

The background consumer may have its own entry point depending on the current Docker configuration.

---

## Prerequisites

Before running the project locally, install:

- [Node.js](https://nodejs.org/) — use a version compatible with the project's `package.json`.
- npm, which is installed with Node.js.
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Docker Compose, or local installations of MongoDB, PostgreSQL, and RabbitMQ.
- Git.
- An API testing tool such as [Postman](https://www.postman.com/).

For a Docker-based setup, you generally do not need to install MongoDB, PostgreSQL, or RabbitMQ separately.

---

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/vansh12125/Api-Montior-System
cd api-monitor-js-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the environment file

Create a `.env` file in the project root.

```bash
cp .env.example .env
```

On Windows Command Prompt, you can use:

```bat
copy .env.example .env
```

If `.env.example` does not exist yet, create `.env` manually using the variables required by the project configuration.

Never commit real `.env` credentials to Git.

### 4. Configure the databases and queue

Make sure MongoDB, PostgreSQL, and RabbitMQ are running and that their connection settings match your `.env` file.

For a local setup, connection hosts are usually `localhost`.

For Docker Compose, application containers normally connect to other services using their Compose service names.

### 5. Initialize PostgreSQL

The `endpoint_metrics` table must exist before the analytics repository can query or update it.

If your initialization SQL is mounted inside the PostgreSQL container, run the appropriate initialization command. For example, when the file is available at the stated path:

```bash
docker compose exec postgres \
  psql -U postgres -d api_monitoring \
  -v ON_ERROR_STOP=1 \
  -f /docker-entrypoint-initdb.d/init-postgres.sql
```

The database name, username, container service name, and file path must match your configuration.

### 6. Start the application

Use the start script defined in your `package.json`.

For example, if the project uses `node src/server.js`:

```bash
node src/server.js
```

If a development script is configured, use:

```bash
npm run dev
```

Check the terminal logs to confirm that the server and its required connections started successfully.

---

## Environment Variables

The exact names depend on your `src/constants/` and `src/configs/` files. The following table describes the configuration categories the application needs.

| Category | Example variable | Purpose |
|---|---|---|
| Environment | `NODE_ENV` | Development or production mode |
| Server | `SERVER_PORT` | HTTP server port |
| API | `API_VERSION` | API version prefix |
| Frontend | `FRONTEND_URL` | Allowed frontend origin |
| MongoDB | `MONGODB_URI` | MongoDB connection string |
| PostgreSQL | `POSTGRES_HOST` | PostgreSQL hostname |
| PostgreSQL | `POSTGRES_PORT` | PostgreSQL port |
| PostgreSQL | `POSTGRES_DB` | PostgreSQL database name |
| PostgreSQL | `POSTGRES_USER` | PostgreSQL username |
| PostgreSQL | `POSTGRES_PASSWORD` | PostgreSQL password |
| RabbitMQ | `RABBITMQ_URL` | RabbitMQ connection URL |
| RabbitMQ | `RABBITMQ_QUEUE` | Queue used for metric events |
| Rate limiting | `RATE_LIMIT_WINDOW_MS` | Rate-limit time window |
| Rate limiting | `RATE_LIMIT_MAX_REQUESTS` | Normal route request limit |
| Authentication | JWT secret variables | Token signing and verification |
| Password hashing | bcrypt configuration | Password-hashing settings |

These are illustrative names, not a verified list of the exact environment variables in your repository. Check the configuration files before copying them into `.env`.

Do not use production secrets in example files. Generate strong, unique credentials for deployment.

---

## Running with Docker

Docker Compose can run the backend and its supporting services together.

The expected service roles are:

| Service | Purpose | Typical port |
|---|---|---:|
| API application | Receives HTTP requests | `5000` |
| PostgreSQL | Stores aggregated metrics | `5432` |
| MongoDB | Stores document data | `27017` |
| RabbitMQ | Message broker | `5672` |
| RabbitMQ Management | Queue administration UI | `15672` |
| pgAdmin | PostgreSQL administration UI | `8080` |

Actual ports depend on the current `docker-compose.yml`.

### Start the services

```bash
docker compose up -d --build
```

### Check running containers

```bash
docker compose ps
```

### View application logs

```bash
docker compose logs -f
```

To inspect one service:

```bash
docker compose logs -f api-app
```

Use the service names defined in your Compose file.

### Stop the services

```bash
docker compose down
```

This stops and removes the Compose containers and network, but normally preserves named volumes.

**Warning:** Avoid `docker compose down -v` unless you intend to delete the associated volumes and their stored data.

---

## API Usage

The API routes are organized into modules.

With the version prefix `/api/v1`, the route groups follow this structure:

| Route prefix | Responsibility |
|---|---|
| `/api/v1/auth` | Authentication |
| `/api/v1/client` | Client and API key management |
| `/api/v1/ingest` | Metric ingestion |
| `/api/v1/analytics` | Metrics and reports |

The examples below show the intended request patterns. Confirm the exact route paths and field names in each module's route and validation files.

### 1. Ingest an API metric

Example request:

```http
POST /api/v1/ingest
Content-Type: application/json
X-API-Key: YOUR_API_KEY
```

Example JSON body:

```json
{
  "serviceName": "store-api",
  "endpoint": "/products",
  "method": "GET",
  "statusCode": 200,
  "latencyMs": 42,
  "timestamp": "2026-10-16T12:00:00.000Z"
}
```

The payload illustrates common metric fields; the exact accepted schema is determined by your ingestion validator.

A successful ingestion response means the event has been accepted according to the endpoint's behavior. It does not necessarily mean all background database writes have already completed.

### 2. Authentication

Authentication endpoints are provided under `/api/v1/auth`.

Use the routes implemented in `src/services/auth/routes/` to register or authenticate a user and obtain the required authentication credentials.

Protected routes must receive the authentication mechanism expected by the backend, such as an authorized session cookie or bearer token.

### 3. Client management

Client-related operations are organized under `/api/v1/client`.

These operations may include client creation, client access management, and API key management, depending on the configured route definitions and permissions.

### 4. Analytics

Analytics endpoints are organized under `/api/v1/analytics`.

A dashboard request may accept filters such as:

- `startTime`
- `endTime`
- `limit`

For example, if your dashboard endpoint is registered at `/api/v1/analytics/dashboard`:

```http
GET /api/v1/analytics/dashboard?startTime=2026-10-01T00:00:00.000Z&endTime=2026-10-16T23:59:59.999Z&limit=100
```

The backend should derive the client's identity from the authenticated user rather than trusting a client ID supplied in the query string.

### Example JSON response

```json
{
  "success": true,
  "message": "Dashboard fetched successfully",
  "data": {
    "summary": {
      "totalHits": 1000,
      "errorHits": 25,
      "errorRate": 2.5,
      "successRate": 97.5,
      "avgLatency": 42,
      "uniqueServices": 3,
      "uniqueEndpoints": 12
    },
    "topEndpoints": [],
    "metrics": [],
    "timeRange": {
      "startTime": "2026-10-01T00:00:00.000Z",
      "endTime": "2026-10-16T23:59:59.999Z"
    }
  }
}
```

The values are illustrative. Your actual response depends on the stored data and the analytics service's response structure.

---

## Analytics and Dashboard

The analytics layer reads aggregated data from PostgreSQL rather than recalculating every metric from raw events for each dashboard request.

### Summary metrics

- **Total hits:** Total recorded requests matching the filters.
- **Error hits:** Requests classified as errors by the application's metric rules.
- **Error rate:** Error hits divided by total hits, multiplied by 100.
- **Success rate:** Successful hits divided by total hits, multiplied by 100.
- **Average latency:** Average response latency calculated using the stored aggregate data.
- **Unique services:** Number of distinct services represented in the matching records.
- **Unique endpoints:** Number of distinct endpoints represented in the matching records.

### Time filtering

A date range limits which time buckets are included in an analytics query.

For consistent reports, use the same date filters for summary statistics, top endpoints, detailed metrics, and CSV exports.

The dashboard's display limit should not silently become a limit on the summary's totals. Summary queries can cover all matching records while a displayed metrics list contains only a limited number of rows.

---

## CSV Export

CSV export allows users to download their matching metrics and open them in spreadsheet applications.

The general process is:

1. The frontend sends the start date, end date, and optional row limit.
2. The backend authenticates the user.
3. The backend derives the client ID from the authenticated user.
4. PostgreSQL retrieves matching metric records.
5. The backend converts the rows into CSV format.
6. Express sends the CSV with a download response header.
7. The browser downloads the file.

Example request pattern:

```http
GET /api/v1/analytics/export?startTime=2026-10-01T00:00:00.000Z&endTime=2026-10-16T23:59:59.999Z&limit=5000
```

The actual export path must match the route registered in your application.

The optional `limit` determines the maximum number of exported rows. If no limit is provided, the backend can export all matching records, subject to configured resource and execution limits.

For large exports, database and CSV streams are preferable to building the entire CSV in memory.

---

## Rate Limiting

Rate limiting controls how many requests a client can make during a configured time window.

Example configuration:

```javascript
const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false
});

const ingestLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 600,
  standardHeaders: "draft-8",
  legacyHeaders: false
});
```

These are example settings and must be adjusted to match the application's traffic and capacity.

Normal routes and ingestion routes should be mounted so the intended limiters apply to each route group without accidentally applying the lower general limit to ingestion.

For production deployments with multiple API instances, use a shared rate-limit store. IP-based limits should be complemented with per-client or API-key quotas for ingestion.

---

## Database Design

### MongoDB

MongoDB is suitable for document-oriented data, such as users, clients, API key records, and detailed events where the relevant models are implemented.

It supports flexible document structures and indexes for common lookups.

### PostgreSQL

PostgreSQL stores structured, aggregated endpoint metrics.

The `endpoint_metrics` table contains fields such as:

| Column | Meaning |
|---|---|
| `id` | Unique row identifier |
| `client_id` | Client associated with the metric |
| `service_name` | Name of the monitored service |
| `endpoint` | API endpoint path |
| `method` | HTTP method |
| `time_bucket` | Time interval represented by the aggregate |
| `total_hits` | Number of recorded requests |
| `error_hits` | Number of requests classified as errors |
| `avg_latency` | Average latency for the aggregate |
| `min_latency` | Minimum observed latency |
| `max_latency` | Maximum observed latency |
| `created_at` | Record creation time |
| `updated_at` | Last update time |

A unique constraint on `(client_id, service_name, endpoint, method, time_bucket)` helps ensure there is one aggregate row for each combination.

The repository can use an upsert to insert a new bucket or update an existing one as more events are processed.

### Why use two databases?

MongoDB and PostgreSQL serve different purposes in this design:

- MongoDB is useful for flexible document storage.
- PostgreSQL is useful for structured aggregates, grouping, filtering, and analytics.

This division can improve query efficiency, but the processing pipeline must handle retries and failures carefully to avoid losing events or counting the same event more than once.

---

## Error Handling

The project uses a custom `ApiError` class and a `ResponseFormatter` utility.

`ApiError` represents an application error with an HTTP status code.

`ResponseFormatter` standardizes JSON response structures.

### Example success response

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {},
  "statusCode": 200,
  "timestamp": "2026-10-16T12:00:00.000Z"
}
```

### Example error response

```json
{
  "success": false,
  "message": "Invalid request parameters",
  "error": null,
  "statusCode": 400,
  "timestamp": "2026-10-16T12:00:00.000Z"
}
```

These examples illustrate the response format; actual messages and error details depend on the endpoint.

CSV downloads are returned as file responses rather than JSON-formatted responses.

---

## Security

Important security practices for API Monitor include:

- Keep API keys, passwords, and JWT secrets in environment variables.
- Never commit `.env` files containing real credentials.
- Validate all incoming event payloads.
- Verify API key permissions before accepting ingestion events.
- Enforce client-level data isolation in analytics and export queries.
- Use secure password hashing for passwords.
- Configure CORS for trusted origins.
- Use Helmet for security-related HTTP headers.
- Apply rate limiting to sensitive and high-volume routes.
- Restrict request-body size.
- Avoid logging credentials and sensitive payload fields.
- Use HTTPS in production.
- Restrict database and RabbitMQ management interfaces to trusted users.
- Handle message acknowledgments, retries, and dead-letter queues carefully.
- Protect CSV exports against spreadsheet formula injection.

A valid API key should authorize only the actions permitted for its associated client.

---

## Troubleshooting

### PostgreSQL connection errors

Check the PostgreSQL service status and connection configuration.

```bash
docker compose ps
docker compose logs postgres
```

Confirm that the database name, username, password, host, and port are correct.

### Missing `endpoint_metrics` table

Check whether the PostgreSQL initialization script has run successfully.

Inspect the database:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

Run the correct initialization script if the table has not been created.

### RabbitMQ connection errors

Check the RabbitMQ logs:

```bash
docker compose logs rabbitmq
```

Verify the connection URL, credentials, virtual host, queue configuration, and network settings.

The API and consumer should connect using the correct Compose service hostname when running inside Docker.

### Events are accepted but metrics do not update

Check the following:

1. The event was published successfully.
2. The intended queue exists.
3. The consumer is running and subscribed to the queue.
4. The consumer logs show whether processing succeeded or failed.
5. PostgreSQL is reachable and the metrics table exists.
6. Retry and dead-letter handling are behaving as expected.

An ingestion success response does not necessarily prove that the aggregate has already been updated.

### Rate limit triggers too early

Verify whether multiple limiters are applied to the same route.

Check whether the limiter uses IP addresses or an authenticated client/API key as its key, and whether the application is using a shared store across instances.

### Dashboard totals differ from exported or displayed rows

Confirm that the summary and export use the same client and date filters.

Also remember that a limited dashboard response may contain fewer rows than the total number of records included in summary statistics.

---

## Future Improvements

Potential improvements include:

- Official client SDKs for Express, Java, Python, and other frameworks.
- Client-specific quotas and configurable ingestion limits.
- More robust idempotent event processing.
- Durable retries and dead-letter queue monitoring.
- Background CSV export jobs for very large reports.
- API latency percentiles, such as p95 and p99.
- Alerts for elevated error rates or latency.
- Improved queue and consumer health monitoring.
- Integration and load testing.
- Automated database migrations.
- Deployment documentation and operational monitoring.

---

## Contributing

Contributions and suggestions are welcome.

For changes to the project:

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes.
4. Commit your changes with a descriptive message.
5. Open a pull request describing the changes.

---

## License

Add the license that applies to this repository before distributing or publishing the project.

If no license has been selected, the repository should not claim to be open source under a particular license.

---

## Author

**Vansh Sahu**

GitHub: [vansh12125](https://github.com/vansh12125)

LeetCode: [Vansh_12125](https://leetcode.com/u/Vansh_12125/)

---

*API Monitor — Collect API metrics, process events, and understand application performance.*
