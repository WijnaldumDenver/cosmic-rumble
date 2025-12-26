import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const purchaseSchema = z.object({
  cardId: z.string(),
  cardType: z.enum(["Character", "Item", "Battlefield"]),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { cardId, cardType } = purchaseSchema.parse(body)

    // Get user with current balance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get card and price
    let card: any
    let price: number

    if (cardType === "Character") {
      card = await prisma.characterCard.findUnique({
        where: { id: cardId },
      })
    } else if (cardType === "Item") {
      card = await prisma.itemCard.findUnique({
        where: { id: cardId },
      })
    } else {
      card = await prisma.battlefieldCard.findUnique({
        where: { id: cardId },
      })
    }

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 })
    }

    if (!card.shopPrice) {
      return NextResponse.json(
        { error: "Card is not available for purchase" },
        { status: 400 }
      )
    }

    price = card.shopPrice

    // Check if user already owns the card
    const existing = await prisma.unlockedCard.findUnique({
      where: {
        userId_cardType_cardId: {
          userId: session.user.id,
          cardType,
          cardId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "You already own this card" },
        { status: 400 }
      )
    }

    // Check balance
    if (user.verseCoins < price) {
      return NextResponse.json(
        { error: "Insufficient Verse Coins" },
        { status: 400 }
      )
    }

    // Perform purchase transaction
    await prisma.$transaction(async (tx) => {
      // Deduct coins
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          verseCoins: {
            decrement: price,
          },
        },
      })

      // Unlock card
      await tx.unlockedCard.create({
        data: {
          userId: session.user.id,
          cardType,
          cardId,
        },
      })
    })

    return NextResponse.json(
      {
        success: true,
        card: {
          id: card.id,
          name: card.name,
          type: cardType,
        },
        newBalance: user.verseCoins - price,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error purchasing card:", error)
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

