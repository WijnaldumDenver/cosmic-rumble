// Helper functions for loading user cards into game

import { prisma } from "../prisma"

export interface GameCard {
  id: string
  name: string
  imageUrl: string
  rarity: string
  franchise: string
  cardType: "Character" | "Item" | "Battlefield"
  // Character-specific
  power?: number
  defense?: number
  speed?: number
  ability?: string
  // Item-specific
  effect?: string
}

/**
 * Load user's unlocked cards and convert them to game format
 */
export async function loadUserCards(userId: string): Promise<GameCard[]> {
  // Get all unlocked cards for the user
  const unlockedCards = await prisma.unlockedCard.findMany({
    where: { userId },
  })

  if (unlockedCards.length === 0) {
    return []
  }

  // Group by card type
  const characterCardIds = unlockedCards
    .filter((uc) => uc.cardType === "Character")
    .map((uc) => uc.cardId)
  const itemCardIds = unlockedCards
    .filter((uc) => uc.cardType === "Item")
    .map((uc) => uc.cardId)

  // Fetch cards in parallel
  const [characterCards, itemCards] = await Promise.all([
    characterCardIds.length > 0
      ? prisma.characterCard.findMany({
          where: { id: { in: characterCardIds } },
        })
      : [],
    itemCardIds.length > 0
      ? prisma.itemCard.findMany({
          where: { id: { in: itemCardIds } },
        })
      : [],
  ])

  // Convert to game format
  const gameCards: GameCard[] = []

  // Add character cards
  for (const card of characterCards) {
    gameCards.push({
      id: card.id,
      name: card.name,
      imageUrl: card.imageUrl,
      rarity: card.rarity,
      franchise: card.franchise,
      cardType: "Character",
      power: card.power,
      defense: card.defense,
      speed: card.speed,
      ability: card.ability || undefined,
    })
  }

  // Add item cards
  for (const card of itemCards) {
    gameCards.push({
      id: card.id,
      name: card.name,
      imageUrl: card.imageUrl,
      rarity: card.rarity,
      franchise: card.franchise,
      cardType: "Item",
      effect: card.effect,
    })
  }

  return gameCards
}

/**
 * Create a deck from user's cards (shuffled)
 * Returns a deck with up to 30 cards (or all cards if less than 30)
 */
export function createDeck(cards: GameCard[]): GameCard[] {
  // Shuffle cards
  const shuffled = [...cards].sort(() => Math.random() - 0.5)
  
  // Limit to 30 cards for the deck
  return shuffled.slice(0, Math.min(30, shuffled.length))
}

/**
 * Draw initial hand from deck (5 cards)
 */
export function drawInitialHand(deck: GameCard[]): {
  hand: GameCard[]
  remainingDeck: GameCard[]
} {
  const hand = deck.slice(0, 5)
  const remainingDeck = deck.slice(5)
  return { hand, remainingDeck }
}

