import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all waiting games that aren't full
    const games = await prisma.gameSession.findMany({
      where: {
        status: "Waiting",
      },
      include: {
        host: {
          select: {
            id: true,
            username: true,
          },
        },
        players: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to 50 most recent games
    })

    // Filter out games that are full
    const availableGames = games.filter(
      (game) => game.players.length < game.maxPlayers
    )

    // Format games for frontend
    const formattedGames = availableGames.map((game) => ({
      id: game.id,
      host: game.host.username,
      hostId: game.host.id,
      maxPlayers: game.maxPlayers,
      currentPlayers: game.players.length,
      players: game.players.map((p) => ({
        id: p.user.id,
        username: p.user.username,
      })),
      createdAt: game.createdAt,
    }))

    return NextResponse.json({ games: formattedGames }, { status: 200 })
  } catch (error) {
    console.error("Error listing games:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

