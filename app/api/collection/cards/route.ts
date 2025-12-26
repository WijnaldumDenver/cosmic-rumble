import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's unlocked cards
    const unlockedCards = await prisma.unlockedCard.findMany({
      where: { userId: session.user.id },
      orderBy: { unlockedAt: "desc" },
    })

    // Separate by card type
    const characterIds = unlockedCards
      .filter((uc) => uc.cardType === "Character")
      .map((uc) => uc.cardId)
    const itemIds = unlockedCards
      .filter((uc) => uc.cardType === "Item")
      .map((uc) => uc.cardId)
    const battlefieldIds = unlockedCards
      .filter((uc) => uc.cardType === "Battlefield")
      .map((uc) => uc.cardId)

    // Fetch all cards in parallel
    const [characterCards, itemCards, battlefieldCards] = await Promise.all([
      characterIds.length > 0
        ? prisma.characterCard.findMany({
            where: { id: { in: characterIds } },
          })
        : [],
      itemIds.length > 0
        ? prisma.itemCard.findMany({
            where: { id: { in: itemIds } },
          })
        : [],
      battlefieldIds.length > 0
        ? prisma.battlefieldCard.findMany({
            where: { id: { in: battlefieldIds } },
          })
        : [],
    ])

    // Create a map of unlocked cards for quick lookup
    const unlockedMap = new Map(
      unlockedCards.map((uc) => [`${uc.cardType}:${uc.cardId}`, uc])
    )

    // Combine and format cards
    const cards: any[] = [
      ...characterCards.map((card) => {
        const unlocked = unlockedMap.get(`Character:${card.id}`)
        return {
          id: card.id,
          name: card.name,
          imageUrl: card.imageUrl,
          rarity: card.rarity,
          franchise: card.franchise,
          description: card.description,
          type: "Character" as const,
          power: card.power,
          defense: card.defense,
          speed: card.speed,
          unlockedAt: unlocked?.unlockedAt.toISOString() || new Date().toISOString(),
        }
      }),
      ...itemCards.map((card) => {
        const unlocked = unlockedMap.get(`Item:${card.id}`)
        return {
          id: card.id,
          name: card.name,
          imageUrl: card.imageUrl,
          rarity: card.rarity,
          franchise: card.franchise,
          description: card.description,
          type: "Item" as const,
          unlockedAt: unlocked?.unlockedAt.toISOString() || new Date().toISOString(),
        }
      }),
      ...battlefieldCards.map((card) => {
        const unlocked = unlockedMap.get(`Battlefield:${card.id}`)
        return {
          id: card.id,
          name: card.name,
          imageUrl: card.imageUrl,
          rarity: "Common" as const, // Battlefield cards don't have rarity
          franchise: card.franchise,
          description: card.description,
          type: "Battlefield" as const,
          unlockedAt: unlocked?.unlockedAt.toISOString() || new Date().toISOString(),
        }
      }),
    ]

    return NextResponse.json({ cards }, { status: 200 })
  } catch (error) {
    console.error("Error fetching collection:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

