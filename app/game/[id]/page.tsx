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
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>
  }

  return (
    <div className="min-h-screen p-8 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-5xl font-black bg-crossover-gradient bg-clip-text text-transparent">
            Battle Arena
          </h1>
          <div className={`px-6 py-3 rounded-xl font-bold ${
            connected 
              ? "bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.8)]" 
              : "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.8)]"
          }`}>
            {connected ? "⚡ Connected" : "⚠ Disconnected"}
          </div>
        </div>

        {gameState ? (
          <div className="space-y-6">
            {/* Game Status */}
            <div className="card-bg rounded-xl p-6 border-2 border-crossover-accent/30">
              <h2 className="text-2xl font-bold mb-4 text-white">Battle Status</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-white/70 font-semibold">Status</div>
                  <div className="font-bold text-white capitalize text-lg">{gameState.status}</div>
                </div>
                <div>
                  <div className="text-sm text-white/70 font-semibold">Turn</div>
                  <div className="font-bold text-crossover-gold text-lg">{gameState.turnNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-white/70 font-semibold">Phase</div>
                  <div className="font-bold text-white capitalize text-lg">{gameState.currentPhase || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm text-white/70 font-semibold">Current Player</div>
                  <div className="font-bold text-crossover-accent text-lg">
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
                  className={`card-bg rounded-xl p-6 border-2 ${
                    player.userId === gameState.currentTurnPlayerId 
                      ? "border-crossover-gold shadow-crossover-glow-gold" 
                      : "border-crossover-primary/30"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-2xl font-bold mb-4 text-white">{player.username}</h3>
                  <div className="space-y-2 text-white">
                    <div className="font-semibold">HP: <span className="text-red-400 font-bold">{player.hp}</span></div>
                    <div className="font-semibold">Characters: <span className="text-crossover-accent font-bold">{player.deployedCharacters.length}</span></div>
                    <div className="font-semibold">Items: <span className="text-crossover-secondary font-bold">{player.deployedItems.length}</span></div>
                    <div className="font-semibold">Hand: <span className="text-crossover-gold font-bold">{player.hand.length} cards</span></div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Game Actions */}
            {gameState.currentTurnPlayerId === session.user.id && gameState.status === "active" && (
              <div className="card-bg rounded-xl p-6 border-2 border-crossover-gold/50">
                <h2 className="text-2xl font-bold mb-4 text-white">⚔️ Your Turn</h2>
                <div className="flex flex-wrap gap-4">
                  {gameState.currentPhase === "draw" && (
                    <button
                      onClick={() => handleGameAction({ type: "draw" })}
                      className="btn-blue px-6 py-3 rounded-xl font-bold"
                    >
                      Draw Card
                    </button>
                  )}
                  {gameState.currentPhase === "deploy" && (
                    <button
                      onClick={() => handleGameAction({ type: "deploy", data: { cardId: "", cardType: "Character" } })}
                      className="btn-gold px-6 py-3 rounded-xl font-bold"
                    >
                      Deploy (Placeholder)
                    </button>
                  )}
                  {gameState.currentPhase === "battle" && (
                    <button
                      onClick={() => handleGameAction({ type: "attack", data: { targetId: "" } })}
                      className="btn-epic px-6 py-3 rounded-xl font-bold"
                    >
                      Attack (Placeholder)
                    </button>
                  )}
                  <button
                    onClick={() => handleGameAction({ type: "end_turn" })}
                    className="bg-crossover-dark border-2 border-white/30 text-white px-6 py-3 rounded-xl font-bold hover:bg-crossover-darker"
                  >
                    End Turn
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-xl text-white">Loading game state...</div>
          </div>
        )}
      </div>
    </div>
  )
}

