// WebSocket Server Setup
// Handles real-time game communication

import { Server as SocketIOServer } from "socket.io"
import { Server as HTTPServer } from "http"
import { GameEngine } from "../game/engine"

export interface GameSocketData {
  userId: string
  gameSessionId: string | null
}

export class GameSocketServer {
  private io: SocketIOServer | null = null
  private gameEngines: Map<string, GameEngine> = new Map()

  constructor(httpServer?: HTTPServer) {
    if (httpServer) {
      this.io = new SocketIOServer(httpServer, {
        cors: {
          origin: process.env.NEXTAUTH_URL || process.env.CORS_ORIGIN || "http://localhost:3000",
          methods: ["GET", "POST"],
          credentials: true,
        },
        path: "/api/socket",
      })

      this.setupHandlers()
    }
  }

  private setupHandlers() {
    if (!this.io) return
    
    this.io.on("connection", (socket) => {
      console.log("Client connected:", socket.id)

      socket.on("join_game", async (data: { gameSessionId: string; userId: string }) => {
        try {
          socket.join(`game:${data.gameSessionId}`)
          socket.data = {
            userId: data.userId,
            gameSessionId: data.gameSessionId,
          }

          // Load or create game engine
          if (!this.gameEngines.has(data.gameSessionId)) {
            const engine = await GameEngine.initialize(data.gameSessionId)
            this.gameEngines.set(data.gameSessionId, engine)
          }

          // Send current game state
          const engine = this.gameEngines.get(data.gameSessionId)!
          const state = engine.getState()
          socket.emit("game_state", state)

          // Notify other players
          socket.to(`game:${data.gameSessionId}`).emit("player_joined", {
            userId: data.userId,
          })
        } catch (error) {
          console.error("Error joining game:", error)
          socket.emit("error", { message: "Failed to join game" })
        }
      })

      socket.on("game_action", async (action: any) => {
        try {
          const gameSessionId = socket.data?.gameSessionId
          if (!gameSessionId) {
            socket.emit("error", { message: "Not in a game session" })
            return
          }

          const engine = this.gameEngines.get(gameSessionId)
          if (!engine) {
            socket.emit("error", { message: "Game engine not found" })
            return
          }

          const result = await engine.processAction(action)
          if (!result.success) {
            socket.emit("error", { message: result.error })
            return
          }

          // Save state
          await engine.saveState(gameSessionId)

          // Broadcast update to all players in the game
          const state = engine.getState()
          if (this.io) {
            this.io.to(`game:${gameSessionId}`).emit("game_state", state)
            this.io.to(`game:${gameSessionId}`).emit("game_action_result", result.updates)
          }
        } catch (error) {
          console.error("Error processing game action:", error)
          socket.emit("error", { message: "Failed to process action" })
        }
      })

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id)
        const gameSessionId = socket.data?.gameSessionId
        if (gameSessionId) {
          socket.to(`game:${gameSessionId}`).emit("player_left", {
            userId: socket.data?.userId,
          })
        }
      })
    })
  }

  getIO(): SocketIOServer | null {
    return this.io
  }
}

