import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check cooldown (once per week)
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    if (user.weeklyWheelLastSpin && user.weeklyWheelLastSpin > oneWeekAgo) {
      const timeUntilNext = new Date(
        user.weeklyWheelLastSpin.getTime() + 7 * 24 * 60 * 60 * 1000
      )
      return NextResponse.json(
        {
          error: "Weekly wheel is on cooldown",
          nextSpinAvailable: timeUntilNext,
        },
        { status: 400 }
      )
    }

    // Get all wheel-eligible cards
    const allCards = await prisma.characterCard.findMany({
      where: { isWheelEligible: true },
    })

    const itemCards = await prisma.itemCard.findMany({
      where: { isWheelEligible: true },
    })

    // Get user's unlocked cards
    const unlockedCards = await prisma.unlockedCard.findMany({
      where: { userId: session.user.id },
    })

    // Create a set of unlocked card IDs for quick lookup
    const unlockedSet = new Set(
      unlockedCards.map((uc) => `${uc.cardType}:${uc.cardId}`)
    )

    // Filter out owned cards
    const availableCards = [
      ...allCards
        .filter((c) => !unlockedSet.has(`Character:${c.id}`))
        .map((c) => ({ ...c, type: "Character" })),
      ...itemCards
        .filter((c) => !unlockedSet.has(`Item:${c.id}`))
        .map((c) => ({ ...c, type: "Item" })),
    ]

    if (availableCards.length === 0) {
      return NextResponse.json(
        { error: "No available cards to unlock" },
        { status: 400 }
      )
    }

    // Weight by rarity (higher rarity = lower chance)
    const weights: Record<string, number> = {
      Common: 50,
      Uncommon: 30,
      Rare: 15,
      Epic: 4,
      Legendary: 0.9,
      Mythical: 0.1,
    }

    const weightedCards: any[] = []
    for (const card of availableCards) {
      const weight = weights[card.rarity] || 1
      for (let i = 0; i < weight; i++) {
        weightedCards.push(card)
      }
    }

    // Random selection
    const randomIndex = Math.floor(Math.random() * weightedCards.length)
    const selectedCard = weightedCards[randomIndex]

    // Card type is already included in the mapped cards
    const cardType = selectedCard.type

    // Unlock card
    await prisma.unlockedCard.create({
      data: {
        userId: session.user.id,
        cardType,
        cardId: selectedCard.id,
      },
    })

    // Update last spin time
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        weeklyWheelLastSpin: now,
      },
    })

    return NextResponse.json(
      {
        card: {
          id: selectedCard.id,
          name: selectedCard.name,
          rarity: selectedCard.rarity,
          imageUrl: selectedCard.imageUrl,
          type: cardType,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error spinning wheel:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

