import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// Mark route as dynamic to prevent static analysis during build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Lazy initialization - only create handler when actually called (not during build)
let handler: ReturnType<typeof NextAuth> | null = null

function getHandler() {
  if (!handler) {
    // NEVER throw during build - Next.js evaluates modules during build phase
    // Railway might not expose env vars during build, so we always use placeholder
    // Validation will happen at actual runtime when requests are made
    // NextAuth will work with the placeholder during build, and fail gracefully at runtime if secret is missing
    handler = NextAuth(authOptions)
  }
  return handler
}

export async function GET(req: Request, context: any) {
  return getHandler()(req, context)
}

export async function POST(req: Request, context: any) {
  return getHandler()(req, context)
}

