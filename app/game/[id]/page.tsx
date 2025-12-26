"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { io, Socket } from "socket.io-client"

export default function GamePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const gameSessionId = params.id as string

  const [socket, setSocket] = useState<Socket | null>(null)
  const [gameState, setGameState] = useState<any>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!session?.user?.id) {
      router.push("/auth/signin")
      return
    }

    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
      path: "/api/socket",
    })

    newSocket.on("connect", () => {
      setConnected(true)
      newSocket.emit("join_game", {
        gameSessionId,
        userId: session.user.id,
      })
    })

    newSocket.on("game_state", (state) => {
      setGameState(state)
    })

    newSocket.on("error", (error) => {
      console.error("Socket error:", error)
      alert(error.message || "Connection error")
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [session, gameSessionId, router])

  const handleGameAction = (action: any) => {
    if (socket && connected) {
      socket.emit("game_action", {
        ...action,
        playerId: session?.user?.id,
      })
    }
  }

  if (!session) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Game Session</h1>
          <div className={`px-4 py-2 rounded ${connected ? "bg-green-500" : "bg-red-500"} text-white`}>
            {connected ? "Connected" : "Disconnected"}
          </div>
        </div>

        {gameState ? (
          <div className="space-y-6">
            {/* Game Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Game Status</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="font-bold capitalize">{gameState.status}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Turn</div>
                  <div className="font-bold">{gameState.turnNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Phase</div>
                  <div className="font-bold capitalize">{gameState.currentPhase || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Current Player</div>
                  <div className="font-bold">
                    {gameState.players[gameState.currentTurnPlayerId]?.username || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* Players */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(gameState.players).map((player: any) => (
                <motion.div
                  key={player.userId}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${
                    player.userId === gameState.currentTurnPlayerId ? "ring-2 ring-blue-500" : ""
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-xl font-semibold mb-2">{player.username}</h3>
                  <div className="space-y-2">
                    <div>HP: {player.hp}</div>
                    <div>Characters: {player.deployedCharacters.length}</div>
                    <div>Items: {player.deployedItems.length}</div>
                    <div>Hand: {player.hand.length} cards</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Game Actions */}
            {gameState.currentTurnPlayerId === session.user.id && gameState.status === "active" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Your Turn</h2>
                <div className="flex gap-4">
                  {gameState.currentPhase === "draw" && (
                    <button
                      onClick={() => handleGameAction({ type: "draw" })}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Draw Card
                    </button>
                  )}
                  {gameState.currentPhase === "deploy" && (
                    <button
                      onClick={() => handleGameAction({ type: "deploy", data: { cardId: "", cardType: "Character" } })}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Deploy (Placeholder)
                    </button>
                  )}
                  {gameState.currentPhase === "battle" && (
                    <button
                      onClick={() => handleGameAction({ type: "attack", data: { targetId: "" } })}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Attack (Placeholder)
                    </button>
                  )}
                  <button
                    onClick={() => handleGameAction({ type: "end_turn" })}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    End Turn
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-xl">Loading game state...</div>
          </div>
        )}
      </div>
    </div>
  )
}

