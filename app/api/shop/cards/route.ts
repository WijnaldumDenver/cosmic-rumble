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
    })

    const unlockedSet = new Set(
      unlockedCards.map((uc) => `${uc.cardType}:${uc.cardId}`)
    )

    // Get all cards available in shop
    const [characterCards, itemCards, battlefieldCards] = await Promise.all([
      prisma.characterCard.findMany({
        where: { shopPrice: { not: null } },
      }),
      prisma.itemCard.findMany({
        where: { shopPrice: { not: null } },
      }),
      prisma.battlefieldCard.findMany({
        where: { shopPrice: { not: null } },
      }),
    ])

    // Combine and format cards
    const allCards = [
      ...characterCards.map((card) => ({
        id: card.id,
        name: card.name,
        imageUrl: card.imageUrl,
        rarity: card.rarity,
        franchise: card.franchise,
        description: card.description,
        shopPrice: card.shopPrice,
        type: "Character" as const,
        power: card.power,
        defense: card.defense,
        speed: card.speed,
        isOwned: unlockedSet.has(`Character:${card.id}`),
      })),
      ...itemCards.map((card) => ({
        id: card.id,
        name: card.name,
        imageUrl: card.imageUrl,
        rarity: card.rarity,
        franchise: card.franchise,
        description: card.description,
        shopPrice: card.shopPrice,
        type: "Item" as const,
        isOwned: unlockedSet.has(`Item:${card.id}`),
      })),
      ...battlefieldCards.map((card) => ({
        id: card.id,
        name: card.name,
        imageUrl: card.imageUrl,
        rarity: "Common" as const, // Battlefield cards don't have rarity in schema
        franchise: card.franchise,
        description: card.description,
        shopPrice: card.shopPrice,
        type: "Battlefield" as const,
        isOwned: unlockedSet.has(`Battlefield:${card.id}`),
      })),
    ]

    // Filter out owned cards (users can't buy what they already have)
    const availableCards = allCards.filter((card) => !card.isOwned)

    return NextResponse.json({ cards: availableCards }, { status: 200 })
  } catch (error) {
    console.error("Error fetching shop cards:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

