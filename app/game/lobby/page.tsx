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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Game Lobby</h1>

        <div className="mb-6">
          <button
            onClick={createGame}
            disabled={creating}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create New Game"}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Available Games</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Game browser coming soon. Create a game to get started!
          </p>
        </div>

        <div className="mt-6">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

