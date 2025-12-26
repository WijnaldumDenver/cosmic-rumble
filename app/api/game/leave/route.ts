import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const leaveGameSchema = z.object({
  gameSessionId: z.string(),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { gameSessionId } = leaveGameSchema.parse(body)

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

    // Check if game is active
    if (gameSession.status === "Active") {
      // Apply penalty
      const penaltyUntil = new Date()
      penaltyUntil.setMinutes(penaltyUntil.getMinutes() + 10) // 10 minute penalty

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          penaltyUntil,
        },
      })
    }

    // Remove player from game
    await prisma.gameSessionPlayer.deleteMany({
      where: {
        gameSessionId,
        userId: session.user.id,
      },
    })

    // If no players left, delete the game session
    const remainingPlayers = await prisma.gameSessionPlayer.count({
      where: { gameSessionId },
    })

    if (remainingPlayers === 0) {
      await prisma.gameSession.delete({
        where: { id: gameSessionId },
      })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error leaving game:", error)
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

