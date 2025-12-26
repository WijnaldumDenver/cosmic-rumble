// Custom Next.js Server with WebSocket Support
// Railway-ready setup (Next.js + Socket.io)

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { GameSocketServer } from "./lib/socket/server";

const PORT = Number(process.env.PORT) || 3000;
const dev = process.env.NODE_ENV !== "production";

// Initialize Next.js app
const app = next({ dev, hostname: "0.0.0.0", port: PORT });
const handle = app.getRequestHandler();

// Railway needs an HTTP server
const server = createServer(async (req, res) => {
  try {
    // Health check endpoint for Railway
    if (req.url === "/api/health" || req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", service: "unirumble" }));
      return;
    }

    // Handle Next.js routes
    const parsedUrl = parse(req.url!, true);
    await handle(req, res, parsedUrl);
  } catch (err) {
    console.error("Error handling request:", req.url, err);
    res.statusCode = 500;
    res.end("internal server error");
  }
});

// Initialize Socket.io WebSocket server
const socketServer = new GameSocketServer(server);

// Start server
app
  .prepare()
  .then(() => {
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to prepare Next.js app:", err);
    process.exit(1);
  });
