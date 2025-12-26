// Health check endpoint for Railway
export async function GET() {
  return new Response(JSON.stringify({ status: "ok", service: "unirumble" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

