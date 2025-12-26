// WebSocket API Route Handler
// This is a placeholder route for Socket.io connections
// 
// IMPORTANT: Vercel does NOT support custom Node.js servers or WebSockets
// To enable real-time multiplayer, you need to:
// 1. Deploy the custom server (server.ts) to Railway, Render, or similar
// 2. Set NEXT_PUBLIC_SOCKET_URL to that server's URL
// 3. Or use a WebSocket service like Pusher/Ably
//
// For local development, run: pnpm dev:server

import { NextRequest } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Return a JSON response that Socket.io can handle
  // This will cause Socket.io to fall back to polling
  return new Response(
    JSON.stringify({
      error: "WebSocket server not available",
      message: "This endpoint requires a custom server. WebSocket features are disabled on Vercel.",
      fallback: "Use polling transport or deploy custom server separately",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
}

