import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { loadUserCards, createDeck, drawInitialHand } from "@/lib/game/cards"

export const dynamic = 'force-dynamic'

const createGameSchema = z.object({
  maxPlayers: z.number().min(2).max(4).default(4),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { maxPlayers } = createGameSchema.parse(body)

    // Check penalty
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (user?.penaltyUntil && user.penaltyUntil > new Date()) {
      return NextResponse.json(
        { error: "You are penalized and cannot create a game" },
        { status: 403 }
      )
    }

    // Load user's cards
    const userCards = await loadUserCards(session.user.id)
    if (userCards.length === 0) {
      return NextResponse.json(
        { error: "You need at least one card to create a game. Visit the shop or spin the wheel!" },
        { status: 400 }
      )
    }

    // Create deck and initial hand
    const deck = createDeck(userCards)
    const { hand, remainingDeck } = drawInitialHand(deck)

    // Create game session
    const gameSession = await prisma.gameSession.create({
      data: {
        hostId: session.user.id,
        maxPlayers,
        status: "Waiting",
        gameState: {
          status: "waiting",
          turnOrder: [],
          currentTurnPlayerId: null,
          currentPhase: null,
          battlefieldCard: null,
          players: {},
          turnNumber: 0,
          winnerId: null,
        },
        players: {
          create: {
            userId: session.user.id,
            position: 0,
            playerState: {
              userId: session.user.id,
              username: session.user.username,
              hp: 100,
              hand: hand,
              deck: remainingDeck,
              deployedCharacters: [],
              deployedItems: [],
              planCard: null,
              position: 0,
              isActive: true,
            } as any,
          },
        },
      },
      include: {
        players: {
          include: { user: true },
        },
      },
    })

    return NextResponse.json({ gameSession }, { status: 201 })
  } catch (error) {
    console.error("Error creating game:", error)
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

