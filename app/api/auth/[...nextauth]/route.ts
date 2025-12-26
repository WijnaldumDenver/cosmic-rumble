import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// Mark route as dynamic to prevent static analysis during build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Runtime validation - check if secret is still placeholder when handler is called
function validateSecret() {
  if (process.env.NODE_ENV === "production" && 
      !process.env.NEXTAUTH_SECRET &&
      authOptions.secret === "YnVpbGQtcGxhY2Vob2xkZXItc2VjcmV0LW11c3Qtc2V0LWluLXByb2Q=") {
    throw new Error(
      "NEXTAUTH_SECRET is required in production. " +
      "Please set it in your Railway environment variables."
    );
  }
}

// Lazy initialization - only create handler when actually called (not during build)
let handler: ReturnType<typeof NextAuth> | null = null

function getHandler() {
  // Validate secret at runtime (not during build)
  validateSecret();
  if (!handler) {
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

