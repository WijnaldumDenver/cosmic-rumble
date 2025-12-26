import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const joinGameSchema = z.object({
  gameSessionId: z.string(),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { gameSessionId } = joinGameSchema.parse(body)

    // Check penalty
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (user?.penaltyUntil && user.penaltyUntil > new Date()) {
      return NextResponse.json(
        { error: "You are penalized and cannot join a game" },
        { status: 403 }
      )
    }

    // Get game session
    const gameSession = await prisma.gameSession.findUnique({
      where: { id: gameSessionId },
      include: {
        players: true,
      },
    })

    if (!gameSession) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    if (gameSession.status !== "Waiting") {
      return NextResponse.json(
        { error: "Game is not accepting new players" },
        { status: 400 }
      )
    }

    if (gameSession.players.length >= gameSession.maxPlayers) {
      return NextResponse.json(
        { error: "Game is full" },
        { status: 400 }
      )
    }

    // Check if already in game
    const alreadyJoined = gameSession.players.some(
      (p) => p.userId === session.user.id
    )
    if (alreadyJoined) {
      return NextResponse.json(
        { error: "Already in this game" },
        { status: 400 }
      )
    }

    // Join game
    await prisma.gameSessionPlayer.create({
      data: {
        gameSessionId,
        userId: session.user.id,
        position: gameSession.players.length,
        playerState: {
          userId: session.user.id,
          username: session.user.username,
          hp: 100,
          hand: [],
          deployedCharacters: [],
          deployedItems: [],
          planCard: null,
          position: gameSession.players.length,
          isActive: true,
        },
      },
    })

    // Check if we should start the game
    const updatedSession = await prisma.gameSession.findUnique({
      where: { id: gameSessionId },
      include: {
        players: true,
      },
    })

    if (updatedSession && updatedSession.players.length >= 2) {
      // Start game if we have at least 2 players
      await prisma.gameSession.update({
        where: { id: gameSessionId },
        data: {
          status: "Active",
        },
      })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error joining game:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

