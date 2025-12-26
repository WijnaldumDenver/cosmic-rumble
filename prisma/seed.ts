// Seed script for initial data
// Run with: pnpm tsx prisma/seed.ts

import { PrismaClient, Rarity, Rank, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create admin user (password: admin123)
  const hashedPassword = await bcrypt.hash("admin123", 10)
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@unirumble.com" },
    update: {},
    create: {
      email: "admin@unirumble.com",
      username: "admin",
      password: hashedPassword,
      role: UserRole.Admin,
      rank: Rank.Platinum,
      verseCoins: 10000,
    },
  })

  console.log("Created admin user:", admin.username)

  // Create sample tags
  const tags = [
    { name: "Fantasy", description: "Fantasy-themed cards" },
    { name: "Sci-Fi", description: "Science fiction themed cards" },
    { name: "Anime", description: "Anime/manga themed cards" },
    { name: "Superhero", description: "Superhero themed cards" },
    { name: "Horror", description: "Horror themed cards" },
  ]

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    })
  }

  console.log("Created tags")

  // Create sample character cards
  const characterCards = [
    {
      franchise: "Fantasy",
      imageUrl: "https://via.placeholder.com/300",
      name: "Dragon Warrior",
      rarity: Rarity.Epic,
      power: 80,
      defense: 60,
      speed: 40,
      description: "A powerful warrior with dragon-like abilities",
      isWheelEligible: true,
      shopPrice: 500,
    },
    {
      franchise: "Sci-Fi",
      imageUrl: "https://via.placeholder.com/300",
      name: "Space Ranger",
      rarity: Rarity.Rare,
      power: 65,
      defense: 50,
      speed: 70,
      description: "A ranger from the stars",
      isWheelEligible: true,
      shopPrice: 300,
    },
    {
      franchise: "Anime",
      imageUrl: "https://via.placeholder.com/300",
      name: "Samurai Hero",
      rarity: Rarity.Legendary,
      power: 90,
      defense: 70,
      speed: 80,
      description: "A legendary samurai warrior",
      isWheelEligible: true,
      shopPrice: 1000,
    },
  ]

  for (const card of characterCards) {
    await prisma.characterCard.create({
      data: card,
    })
  }

  console.log("Created sample character cards")

  // Create sample item cards
  const itemCards = [
    {
      franchise: "Fantasy",
      imageUrl: "https://via.placeholder.com/300",
      name: "Health Potion",
      rarity: Rarity.Common,
      description: "Restores 20 HP",
      effect: '{"type": "heal", "amount": 20}',
      isWheelEligible: true,
      shopPrice: 50,
    },
    {
      franchise: "Sci-Fi",
      imageUrl: "https://via.placeholder.com/300",
      name: "Energy Shield",
      rarity: Rarity.Uncommon,
      description: "Increases defense by 30",
      effect: '{"type": "buff", "stat": "defense", "amount": 30}',
      isWheelEligible: true,
      shopPrice: 150,
    },
  ]

  for (const card of itemCards) {
    await prisma.itemCard.create({
      data: card,
    })
  }

  console.log("Created sample item cards")

  // Create sample battlefield cards
  const battlefieldCards = [
    {
      franchise: "Fantasy",
      imageUrl: "https://via.placeholder.com/800",
      name: "Dragon's Lair",
      description: "All characters gain +10 power",
      effect: '{"type": "global_buff", "stat": "power", "amount": 10}',
      shopPrice: 200,
    },
  ]

  for (const card of battlefieldCards) {
    await prisma.battlefieldCard.create({
      data: card,
    })
  }

  console.log("Created sample battlefield cards")

  console.log("Seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

