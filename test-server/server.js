import "dotenv/config";
import express from "express";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const hit = {
      endpoint: req.path,
      method: req.method,
      statusCode: res.statusCode,
      latencyMs: Date.now() - start,
    };

    sendHit(hit).catch((error) => {
      console.error("Failed to send API hit:", error.message);
    });
  });

  next();
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Test server is running",
  });
});

app.get("/api/users", (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: "Vansh" },
      { id: 2, name: "Rahul" },
    ],
  });
});

app.get("/api/products", (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: "Keyboard", price: 999 },
      { id: 2, name: "Mouse", price: 499 },
    ],
  });
});

app.get("/api/error", (req, res) => {
  res.status(500).json({
    success: false,
    message: "Simulated internal server error",
  });
});

app.get("/api/delay", (req, res) => {
  setTimeout(() => {
    res.json({
      success: true,
      message: "Delayed response",
    });
  }, 1500);
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

async function sendHit({ endpoint, method, statusCode, latencyMs }) {
  const response = await fetch(process.env.INGEST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-key": process.env.API_KEY,
    },
    body: JSON.stringify({
      serviceName: process.env.SERVICE_NAME || "test-service",
      endpoint,
      method,
      statusCode,
      latencyMs,
    }),
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`Ingest failed with HTTP ${response.status}`);
  }

  return response.json();
}

app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
});
