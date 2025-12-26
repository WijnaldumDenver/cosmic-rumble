"use client"

import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import Link from "next/link"

export function Navigation() {
  const { data: session } = useSession()
  const pathname = usePathname()

  // Don't show navigation on auth pages
  if (pathname?.startsWith("/auth")) {
    return null
  }

  if (!session) {
    return (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex gap-2 bg-crossover-dark/95 backdrop-blur-md rounded-xl p-2 border-2 border-crossover-primary/30 shadow-crossover-glow">
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              pathname === "/"
                ? "btn-epic"
                : "bg-crossover-dark/50 text-white/70 hover:text-white hover:bg-crossover-dark"
            }`}
          >
            Home
          </Link>
          <Link
            href="/auth/signin"
            className="px-4 py-2 rounded-lg font-bold text-sm bg-crossover-dark/50 text-white/70 hover:text-white hover:bg-crossover-dark transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="px-4 py-2 rounded-lg font-bold text-sm bg-crossover-dark/50 text-white/70 hover:text-white hover:bg-crossover-dark transition-all"
          >
            Sign Up
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex gap-2 bg-crossover-dark/95 backdrop-blur-md rounded-xl p-2 border-2 border-crossover-primary/30 shadow-crossover-glow flex-wrap justify-center max-w-4xl">
        <Link
          href="/"
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            pathname === "/"
              ? "btn-blue"
              : "bg-crossover-dark/50 text-white/70 hover:text-white hover:bg-crossover-dark"
          }`}
        >
          Home
        </Link>
        <Link
          href="/dashboard"
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            pathname === "/dashboard"
              ? "btn-epic"
              : "bg-crossover-dark/50 text-white/70 hover:text-white hover:bg-crossover-dark"
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/game/lobby"
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            pathname?.startsWith("/game")
              ? "btn-gold"
              : "bg-crossover-dark/50 text-white/70 hover:text-white hover:bg-crossover-dark"
          }`}
        >
          Battle
        </Link>
        <Link
          href="/shop"
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            pathname === "/shop"
              ? "btn-epic"
              : "bg-crossover-dark/50 text-white/70 hover:text-white hover:bg-crossover-dark"
          }`}
        >
          Shop
        </Link>
        <Link
          href="/collection"
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            pathname === "/collection"
              ? "btn-gold"
              : "bg-crossover-dark/50 text-white/70 hover:text-white hover:bg-crossover-dark"
          }`}
        >
          Collection
        </Link>
        <Link
          href="/wheel"
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            pathname === "/wheel"
              ? "btn-epic"
              : "bg-crossover-dark/50 text-white/70 hover:text-white hover:bg-crossover-dark"
          }`}
        >
          Wheel
        </Link>
        {session.user.role === "Admin" && (
          <Link
            href="/admin"
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              pathname === "/admin"
                ? "bg-gradient-to-br from-crossover-orange to-crossover-gold shadow-crossover-glow-gold"
                : "bg-crossover-dark/50 text-white/70 hover:text-white hover:bg-crossover-dark"
            }`}
          >
            Admin
          </Link>
        )}
      </div>
    </div>
  )
}

