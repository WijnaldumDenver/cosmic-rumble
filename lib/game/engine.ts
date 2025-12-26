// Game Engine - Server-authoritative game logic
// All game state changes must go through this engine

import { GameState, PlayerState, GameAction, AttackResult, CharacterCard, ItemCard } from "./types"
import { prisma } from "../prisma"

export class GameEngine {
  private state: GameState

  constructor(initialState: GameState) {
    this.state = initialState
  }

  getState(): GameState {
    return JSON.parse(JSON.stringify(this.state)) // Deep clone
  }

  // Initialize game state from database
  static async initialize(gameSessionId: string): Promise<GameEngine> {
    const session = await prisma.gameSession.findUnique({
      where: { id: gameSessionId },
      include: {
        players: {
          include: { user: true },
        },
        battlefieldCard: true,
      },
    })

    if (!session) {
      throw new Error("Game session not found")
    }

    // Build player states
    const players: Record<string, PlayerState> = {}
    const turnOrder: string[] = []

    for (const player of session.players) {
      const playerState = player.playerState as any
      players[player.userId] = {
        userId: player.userId,
        username: player.user.username,
        hp: playerState?.hp ?? 100,
        hand: playerState?.hand ?? [],
        deck: playerState?.deck ?? [],
        deployedCharacters: playerState?.deployedCharacters ?? [],
        deployedItems: playerState?.deployedItems ?? [],
        planCard: playerState?.planCard ?? null,
        position: player.position,
        isActive: player.isActive,
      }
      turnOrder.push(player.userId)
    }

    // Sort by speed for initial turn order
    turnOrder.sort((a, b) => {
      const aSpeed = this.getPlayerSpeed(players[a])
      const bSpeed = this.getPlayerSpeed(players[b])
      return bSpeed - aSpeed // Higher speed goes first
    })

    const gameState: GameState = {
      status: session.status === "Active" ? "active" : "waiting",
      turnOrder,
      currentTurnPlayerId: turnOrder[0] || null,
      currentPhase: session.status === "Active" ? "draw" : null,
      battlefieldCard: session.battlefieldCard
        ? {
            id: session.battlefieldCard.id,
            name: session.battlefieldCard.name,
            effect: session.battlefieldCard.effect,
            imageUrl: session.battlefieldCard.imageUrl,
          }
        : null,
      players,
      turnNumber: 1,
      winnerId: null,
    }

    return new GameEngine(gameState)
  }

  private static getPlayerSpeed(player: PlayerState): number {
    // Sum of all deployed character speeds
    return player.deployedCharacters.reduce((sum, char) => sum + char.speed, 0)
  }

  // Process game action (server-side validation)
  async processAction(action: GameAction): Promise<{ success: boolean; error?: string; updates?: any }> {
    if (this.state.status !== "active") {
      return { success: false, error: "Game is not active" }
    }

    if (this.state.currentTurnPlayerId !== action.playerId) {
      return { success: false, error: "Not your turn" }
    }

    switch (action.type) {
      case "draw":
        return this.handleDraw(action.playerId)
      case "deploy":
        return this.handleDeploy(action.playerId, action.data)
      case "attack":
        return this.handleAttack(action.playerId, action.data)
      case "end_turn":
        return this.handleEndTurn()
      default:
        return { success: false, error: "Invalid action type" }
    }
  }

  private async handleDraw(playerId: string): Promise<{ success: boolean; error?: string; updates?: any }> {
    if (this.state.currentPhase !== "draw") {
      return { success: false, error: "Not in draw phase" }
    }

    const player = this.state.players[playerId]
    if (!player) {
      return { success: false, error: "Player not found" }
    }

    // Draw a card from deck
    const deck = player.deck || []
    if (deck.length === 0) {
      // No cards left in deck - skip drawing but still advance phase
      this.state.currentPhase = "deploy"
      return {
        success: true,
        updates: {
          phase: "deploy",
          playerId,
          message: "No cards left in deck",
        },
      }
    }

    // Draw one card
    const drawnCard = deck[0]
    player.hand.push(drawnCard)
    player.deck = deck.slice(1)

    // Advance to deploy phase
    this.state.currentPhase = "deploy"

    return {
      success: true,
      updates: {
        phase: "deploy",
        playerId,
        drawnCard,
      },
    }
  }

  private async handleDeploy(
    playerId: string,
    data: { cardId: string; cardType: "Character" | "Item" | "Battlefield" }
  ): Promise<{ success: boolean; error?: string; updates?: any }> {
    if (this.state.currentPhase !== "deploy") {
      return { success: false, error: "Not in deploy phase" }
    }

    const player = this.state.players[playerId]
    if (!player) {
      return { success: false, error: "Player not found" }
    }

    // Find card in hand
    const cardIndex = player.hand.findIndex((c) => c.id === data.cardId)
    if (cardIndex === -1) {
      return { success: false, error: "Card not in hand" }
    }

    const card = player.hand[cardIndex]

    // Remove from hand
    player.hand.splice(cardIndex, 1)

    // Deploy based on type
    if (data.cardType === "Character" && "power" in card) {
      player.deployedCharacters.push(card as CharacterCard)
    } else if (data.cardType === "Item" && "effect" in card) {
      player.deployedItems.push(card as ItemCard)
    } else if (data.cardType === "Battlefield") {
      // Battlefield cards affect the entire game
      // TODO: Apply battlefield effect
    } else {
      return { success: false, error: "Invalid card type for deployment" }
    }

    // Advance to battle phase
    this.state.currentPhase = "battle"

    return {
      success: true,
      updates: {
        phase: "battle",
        playerId,
        deployedCard: card,
      },
    }
  }

  private async handleAttack(
    playerId: string,
    data: { targetId: string; attackerCardId?: string }
  ): Promise<{ success: boolean; error?: string; updates?: any }> {
    if (this.state.currentPhase !== "battle") {
      return { success: false, error: "Not in battle phase" }
    }

    const attacker = this.state.players[playerId]
    const target = this.state.players[data.targetId]

    if (!attacker || !target) {
      return { success: false, error: "Player not found" }
    }

    if (!attacker.isActive || !target.isActive) {
      return { success: false, error: "Player is not active" }
    }

    // Determine attack order based on speed
    const attackerSpeed = attacker.deployedCharacters.reduce((sum, c) => sum + c.speed, 0)
    const targetSpeed = target.deployedCharacters.reduce((sum, c) => sum + c.speed, 0)

    let damage = 0
    let killed = false

    if (data.attackerCardId) {
      // Character attacks character
      const attackerCard = attacker.deployedCharacters.find((c) => c.id === data.attackerCardId)
      if (!attackerCard) {
        return { success: false, error: "Attacker card not found" }
      }

      // Find target character (first deployed, or specific if provided)
      const targetCard = target.deployedCharacters[0]
      if (!targetCard) {
        // Direct player attack
        damage = attackerCard.power
        target.hp = Math.max(0, target.hp - damage)
      } else {
        // Character vs character
        const actualDamage = Math.max(0, attackerCard.power - targetCard.defense)
        targetCard.defense = Math.max(0, targetCard.defense - attackerCard.power)

        if (targetCard.defense <= 0) {
          // Overflow damage to player
          damage = Math.abs(targetCard.defense)
          target.hp = Math.max(0, target.hp - damage)
          // Remove killed character
          const index = target.deployedCharacters.indexOf(targetCard)
          target.deployedCharacters.splice(index, 1)
          killed = true

          // Momentum rule: draw card on kill
          const attackerDeck = attacker.deck || []
          if (attackerDeck.length > 0) {
            const momentumCard = attackerDeck[0]
            attacker.hand.push(momentumCard)
            attacker.deck = attackerDeck.slice(1)
          }
        } else {
          damage = actualDamage
        }
      }
    } else {
      // Direct player attack (sum of all character power)
      damage = attacker.deployedCharacters.reduce((sum, c) => sum + c.power, 0)
      target.hp = Math.max(0, target.hp - damage)
    }

    // Check win conditions
    if (target.hp <= 0) {
      this.state.winnerId = playerId
      this.state.status = "finished"
    } else {
      // Check for 3 defeated characters
      const defeatedCount = this.getDefeatedCharacterCount(target)
      if (defeatedCount >= 3) {
        this.state.winnerId = playerId
        this.state.status = "finished"
      }
    }

    return {
      success: true,
      updates: {
        attackResult: {
          attackerId: playerId,
          targetId: data.targetId,
          damage,
          targetHp: target.hp,
          killed,
        },
      },
    }
  }

  private getDefeatedCharacterCount(player: PlayerState): number {
    // Count characters that were deployed but are no longer in deployedCharacters
    // This is simplified - in production, track defeated characters separately
    return 0 // TODO: Implement proper tracking
  }

  private async handleEndTurn(): Promise<{ success: boolean; error?: string; updates?: any }> {
    // Advance to next player's turn
    const currentIndex = this.state.turnOrder.indexOf(this.state.currentTurnPlayerId!)
    const nextIndex = (currentIndex + 1) % this.state.turnOrder.length

    this.state.currentTurnPlayerId = this.state.turnOrder[nextIndex]
    this.state.currentPhase = "draw"
    this.state.turnNumber++

    return {
      success: true,
      updates: {
        nextPlayerId: this.state.currentTurnPlayerId,
        phase: "draw",
        turnNumber: this.state.turnNumber,
      },
    }
  }

  // Save state to database
  async saveState(gameSessionId: string): Promise<void> {
    await prisma.gameSession.update({
      where: { id: gameSessionId },
      data: {
        gameState: this.state as any,
        status: this.state.status === "finished" ? "Finished" : "Active",
      },
    })

    // Update player states
    for (const [userId, playerState] of Object.entries(this.state.players)) {
      await prisma.gameSessionPlayer.updateMany({
        where: {
          gameSessionId,
          userId,
        },
        data: {
          playerState: playerState as any,
        },
      })
    }
  }
}

