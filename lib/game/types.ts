// Game Engine Types
// Server-authoritative game state types

export type CardType = "Character" | "Item" | "Battlefield"

export interface CharacterCard {
  id: string
  name: string
  power: number
  defense: number
  speed: number
  ability?: string
  imageUrl: string
  rarity: string
}

export interface ItemCard {
  id: string
  name: string
  effect: string
  imageUrl: string
  rarity: string
}

export interface BattlefieldCard {
  id: string
  name: string
  effect: string
  imageUrl: string
}

export interface PlayerState {
  userId: string
  username: string
  hp: number
  hand: (CharacterCard | ItemCard)[]
  deployedCharacters: CharacterCard[]
  deployedItems: ItemCard[]
  planCard: CharacterCard | ItemCard | null // Hidden saved card
  position: number
  isActive: boolean
}

export interface GameState {
  status: "waiting" | "active" | "finished"
  turnOrder: string[] // User IDs in turn order
  currentTurnPlayerId: string | null
  currentPhase: "draw" | "deploy" | "battle" | "end" | null
  battlefieldCard: BattlefieldCard | null
  players: Record<string, PlayerState>
  turnNumber: number
  winnerId: string | null
}

export interface GameAction {
  type: "draw" | "deploy" | "attack" | "use_item" | "end_turn"
  playerId: string
  data?: any
}

export interface AttackResult {
  attackerId: string
  targetId: string
  damage: number
  targetHp: number
  killed: boolean
  momentumCard?: CharacterCard | ItemCard // Card drawn on kill
}

