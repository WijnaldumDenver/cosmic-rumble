"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function GameLobbyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  const createGame = async () => {
    setCreating(true)
    try {
      const response = await fetch("/api/game/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxPlayers: 4 }),
      })

      const data = await response.json()
      if (response.ok) {
        router.push(`/game/${data.gameSession.id}`)
      } else {
        alert(data.error || "Failed to create game")
      }
    } catch (error) {
      alert("An error occurred")
    } finally {
      setCreating(false)
    }
  }

  if (status === "loading" || !session) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black mb-8 bg-crossover-gradient bg-clip-text text-transparent">
          Battle Arena
        </h1>

        <div className="mb-6">
          <button
            onClick={createGame}
            disabled={creating}
            className="btn-gold px-8 py-4 rounded-xl text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "Create New Battle"}
          </button>
        </div>

        <div className="card-bg rounded-xl p-6 border-2 border-crossover-accent/30">
          <h2 className="text-2xl font-bold mb-4 text-white">Available Games</h2>
          <p className="text-white/80">
            Game browser coming soon. Create a game to get started!
          </p>
        </div>

        <div className="mt-6">
          <Link
            href="/dashboard"
            className="text-crossover-gold hover:text-crossover-orange font-bold underline"
          >
            ← Back to Command Center
          </Link>
        </div>
      </div>
    </div>
  )
}

