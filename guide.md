# API Monitor — Integration Guide

This guide explains how to connect any API or backend service to API Monitor so its requests appear in your dashboard.

## 1. What you need

From your API Monitor dashboard, get:

- **Ingest URL** — the API Monitor endpoint that accepts API-hit events.
- **API key** — the key created for your client/service.
- **Service name** — a name to identify the application in the dashboard, such as `my-store-api`.

Keep your API key secret. Send it from your backend/server only. Do not put it in frontend JavaScript, mobile app code, or a public repository.

## 2. What to send

Send an HTTP `POST` request to your ingest URL with the API key in the `x-key` header and a JSON body.

### Required request format

```http
POST <YOUR_INGEST_URL>
Content-Type: application/json
x-key: <YOUR_API_KEY>
```

```json
{
  "serviceName": "my-store-api",
  "endpoint": "/api/products",
  "method": "GET",
  "statusCode": 200,
  "latencyMs": 42
}
```

| Field | Type | Meaning | Example |
|---|---|---|---|
| `serviceName` | string | Name of the service being monitored | `"my-store-api"` |
| `endpoint` | string | Request path on your service, not the API Monitor ingest path | `"/api/products"` |
| `method` | string | HTTP method that was called | `"GET"` |
| `statusCode` | number | HTTP response status code from your service | `200` |
| `latencyMs` | number | Time your service took to handle the request, in milliseconds | `42` |

Use numbers for `statusCode` and `latencyMs`, not strings. Use the HTTP method in uppercase.

> Replace `<YOUR_INGEST_URL>` and `<YOUR_API_KEY>` with the values for your API Monitor setup. The ingest route can vary by deployment, so copy the exact URL shown/configured for your instance.

## 3. Test it with cURL

```bash
curl -X POST "<YOUR_INGEST_URL>" \
  -H "Content-Type: application/json" \
  -H "x-key: <YOUR_API_KEY>" \
  -d '{
    "serviceName": "my-store-api",
    "endpoint": "/api/products",
    "method": "GET",
    "statusCode": 200,
    "latencyMs": 42
  }'
```

If the request fails, check the HTTP status and response body. A successful ingest response means the event was accepted; it does not necessarily mean the dashboard's aggregated metrics have already updated.

## 4. Send events from Node.js

This example uses Node.js 18+ (which has a built-in `fetch`) and sends one sample event.

```js
const INGEST_URL = process.env.API_MONITOR_INGEST_URL;
const API_KEY = process.env.API_MONITOR_API_KEY;

async function sendApiHit({
  serviceName,
  endpoint,
  method,
  statusCode,
  latencyMs,
}) {
  const response = await fetch(INGEST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-key": API_KEY,
    },
    body: JSON.stringify({
      serviceName,
      endpoint,
      method,
      statusCode,
      latencyMs,
    }),
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(
      `API Monitor ingest failed: HTTP ${response.status} — ${body}`
    );
  }

  return body;
}

sendApiHit({
  serviceName: "my-store-api",
  endpoint: "/api/products",
  method: "GET",
  statusCode: 200,
  latencyMs: 42,
})
  .then((result) => console.log("API hit sent:", result))
  .catch((error) => console.error(error.message));
```

Set environment variables on the backend before running your app:

```env
API_MONITOR_INGEST_URL=<YOUR_INGEST_URL>
API_MONITOR_API_KEY=<YOUR_API_KEY>
```

Do not commit `.env` to Git.

## 5. Automatically monitor requests in an Express app

Install no additional package if your Node version supports `fetch`. Register this middleware **before your routes**, so it can measure each response.

```js
const serviceName = process.env.API_MONITOR_SERVICE_NAME || "my-store-api";

app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const endpoint = req.originalUrl.split("?")[0];

    sendApiHit({
      serviceName,
      endpoint,
      method: req.method,
      statusCode: res.statusCode,
      latencyMs: Date.now() - startedAt,
    }).catch((error) => {
      console.error("Failed to send API hit to API Monitor:", error.message);
    });
  });

  next();
});
```

Use the `sendApiHit` function from the previous section in the same module, or import it from a utility module. This middleware sends a monitoring event after each response finishes. Since sending happens asynchronously, it does not wait for API Monitor before responding to your caller.

Avoid monitoring API Monitor's own ingest endpoint with this middleware, or you may create a loop. You may also want to exclude health checks, static assets, and browser-generated paths that you do not want in your metrics.

### Important note about route names

`req.originalUrl` includes the query string, so the example removes it. For routes with dynamic IDs, consider normalizing paths (for example, `/api/users/:id`) rather than recording every concrete ID as a separate endpoint.

## 6. Send a test event from Postman

1. Create a new request and choose **POST**.
2. Paste your exact ingest URL.
3. Under **Headers**, add:
   - `Content-Type` → `application/json`
   - `x-key` → your API key
4. Under **Body → raw → JSON**, paste:

```json
{
  "serviceName": "my-store-api",
  "endpoint": "/api/test",
  "method": "GET",
  "statusCode": 200,
  "latencyMs": 25
}
```

5. Send the request.
6. Check the response, then open the dashboard and select a date range that includes the test event.

## 7. Troubleshooting

- **401/403 or an API-key error:** confirm the key is active, belongs to the correct client, and is sent in the `x-key` header.
- **400 or validation error:** check that all five fields are present, `serviceName` and `endpoint` are strings, `method` is an allowed uppercase HTTP method, and `statusCode`/`latencyMs` are numbers.
- **The ingest request succeeds but no dashboard metrics appear:** confirm the event consumer/processor is running, then check the dashboard's client, service, endpoint, and date filters. Aggregated metrics may update asynchronously.
- **The wrong service appears:** make sure `serviceName` is set to the service you want to track; Postman requests and test-server requests can use different service names.
- **No data for the selected day:** verify the event timestamp/time bucket and the dashboard's timezone and end-date handling.
- **Duplicate-looking endpoints:** normalize paths and remove query strings before sending events.

## 8. Integration checklist

- [ ] I copied the correct ingest URL from my API Monitor deployment.
- [ ] My API key is active and sent in the `x-key` header.
- [ ] The request body contains all five fields.
- [ ] `statusCode` and `latencyMs` are JSON numbers.
- [ ] My service uses a consistent `serviceName`.
- [ ] I tested one event in Postman or with cURL.
- [ ] The processor is running and my dashboard filters include the event's time range.

---

**Security:** API Monitor API keys are secrets. If a key has been exposed in a public repository or client-side code, deactivate/rotate it.
