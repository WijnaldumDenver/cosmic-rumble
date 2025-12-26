"use client"

import { useState, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface Card {
  id: string
  name: string
  imageUrl: string
  rarity: string
  franchise: string
  description?: string
  type: "Character" | "Item" | "Battlefield"
  power?: number
  defense?: number
  speed?: number
  unlockedAt: string
}

export default function CollectionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  // Filters and search
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRarity, setSelectedRarity] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedFranchise, setSelectedFranchise] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"name" | "rarity" | "unlocked">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (session) {
      fetchCollection()
    }
  }, [session, status, router])

  const fetchCollection = async () => {
    try {
      const response = await fetch("/api/collection/cards")

      if (response.ok) {
        const data = await response.json()
        setCards(data.cards || [])
      }
    } catch (err) {
      console.error("Error fetching collection:", err)
    } finally {
      setLoading(false)
    }
  }

  // Get unique franchises for filter
  const franchises = useMemo(() => {
    const unique = Array.from(new Set(cards.map((c) => c.franchise)))
    return unique.sort()
  }, [cards])

  // Filter and sort cards
  const filteredAndSortedCards = useMemo(() => {
    let filtered = cards.filter((card) => {
      // Search filter
      if (searchQuery && !card.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Rarity filter
      if (selectedRarity !== "all" && card.rarity !== selectedRarity) {
        return false
      }

      // Type filter
      if (selectedType !== "all" && card.type !== selectedType) {
        return false
      }

      // Franchise filter
      if (selectedFranchise !== "all" && card.franchise !== selectedFranchise) {
        return false
      }

      return true
    })

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "rarity":
          const rarityOrder = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythical"]
          comparison = rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity)
          break
        case "unlocked":
          comparison = new Date(a.unlockedAt).getTime() - new Date(b.unlockedAt).getTime()
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [cards, searchQuery, selectedRarity, selectedType, selectedFranchise, sortBy, sortOrder])

  const getRarityClass = (rarity: string) => {
    const rarityMap: Record<string, string> = {
      Common: "rarity-common",
      Uncommon: "rarity-uncommon",
      Rare: "rarity-rare",
      Epic: "rarity-epic",
      Legendary: "rarity-legendary",
      Mythical: "rarity-mythical",
    }
    return rarityMap[rarity] || "rarity-common"
  }

  // Calculate collection stats
  const collectionStats = useMemo(() => {
    const total = cards.length
    const byRarity = cards.reduce((acc, card) => {
      acc[card.rarity] = (acc[card.rarity] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const byType = cards.reduce((acc, card) => {
      acc[card.type] = (acc[card.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return { total, byRarity, byType }
  }, [cards])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-2xl">Loading collection...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen p-8 pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-black bg-crossover-gradient bg-clip-text text-transparent">
            My Collection
          </h1>
          <div className="card-bg rounded-xl px-6 py-3 border-2 border-crossover-secondary/30">
            <div className="text-sm text-white/70 font-semibold">Total Cards</div>
            <div className="text-2xl font-black text-crossover-secondary">
              {collectionStats.total}
            </div>
          </div>
        </div>

        {/* Collection Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card-bg rounded-xl p-4 border-2 border-crossover-accent/30">
            <div className="text-sm text-white/70 font-semibold mb-2">Characters</div>
            <div className="text-2xl font-black text-crossover-accent">
              {collectionStats.byType.Character || 0}
            </div>
          </div>
          <div className="card-bg rounded-xl p-4 border-2 border-crossover-primary/30">
            <div className="text-sm text-white/70 font-semibold mb-2">Items</div>
            <div className="text-2xl font-black text-crossover-primary">
              {collectionStats.byType.Item || 0}
            </div>
          </div>
          <div className="card-bg rounded-xl p-4 border-2 border-crossover-gold/30">
            <div className="text-sm text-white/70 font-semibold mb-2">Battlefields</div>
            <div className="text-2xl font-black text-crossover-gold">
              {collectionStats.byType.Battlefield || 0}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card-bg rounded-xl p-6 mb-6 border-2 border-crossover-accent/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-bold mb-2 text-white">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your collection..."
                className="w-full px-4 py-3 bg-crossover-dark/50 border-2 border-crossover-accent/30 rounded-lg focus:ring-2 focus:ring-crossover-accent focus:border-crossover-accent text-white placeholder-white/50"
              />
            </div>

            {/* Rarity Filter */}
            <div>
              <label className="block text-sm font-bold mb-2 text-white">Rarity</label>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="w-full px-4 py-3 bg-crossover-dark/50 border-2 border-crossover-accent/30 rounded-lg focus:ring-2 focus:ring-crossover-accent text-white"
              >
                <option value="all">All Rarities</option>
                <option value="Common">Common</option>
                <option value="Uncommon">Uncommon</option>
                <option value="Rare">Rare</option>
                <option value="Epic">Epic</option>
                <option value="Legendary">Legendary</option>
                <option value="Mythical">Mythical</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-bold mb-2 text-white">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 bg-crossover-dark/50 border-2 border-crossover-accent/30 rounded-lg focus:ring-2 focus:ring-crossover-accent text-white"
              >
                <option value="all">All Types</option>
                <option value="Character">Character</option>
                <option value="Item">Item</option>
                <option value="Battlefield">Battlefield</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Franchise Filter */}
            <div>
              <label className="block text-sm font-bold mb-2 text-white">Franchise</label>
              <select
                value={selectedFranchise}
                onChange={(e) => setSelectedFranchise(e.target.value)}
                className="w-full px-4 py-3 bg-crossover-dark/50 border-2 border-crossover-accent/30 rounded-lg focus:ring-2 focus:ring-crossover-accent text-white"
              >
                <option value="all">All Franchises</option>
                {franchises.map((franchise) => (
                  <option key={franchise} value={franchise}>
                    {franchise}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-bold mb-2 text-white">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "rarity" | "unlocked")}
                className="w-full px-4 py-3 bg-crossover-dark/50 border-2 border-crossover-accent/30 rounded-lg focus:ring-2 focus:ring-crossover-accent text-white"
              >
                <option value="name">Name</option>
                <option value="rarity">Rarity</option>
                <option value="unlocked">Date Unlocked</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-bold mb-2 text-white">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="w-full px-4 py-3 bg-crossover-dark/50 border-2 border-crossover-accent/30 rounded-lg focus:ring-2 focus:ring-crossover-accent text-white"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-white/70 text-sm">
            Showing {filteredAndSortedCards.length} of {cards.length} cards
          </div>
        </div>

        {/* Cards Grid */}
        {filteredAndSortedCards.length === 0 ? (
          <div className="card-bg rounded-xl p-12 text-center border-2 border-crossover-primary/30">
            {cards.length === 0 ? (
              <>
                <div className="text-3xl font-black text-white mb-4">Your Collection is Empty</div>
                <div className="text-white/70 mb-6">Start collecting cards by playing games, spinning the wheel, or visiting the shop!</div>
                <div className="flex gap-4 justify-center">
                  <a
                    href="/shop"
                    className="btn-epic px-6 py-3 rounded-xl font-bold"
                  >
                    Visit Shop
                  </a>
                  <a
                    href="/wheel"
                    className="btn-gold px-6 py-3 rounded-xl font-bold"
                  >
                    Spin Wheel
                  </a>
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-white mb-2">No cards match your filters</div>
                <div className="text-white/70">Try adjusting your search or filters</div>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedCards.map((card) => (
              <motion.div
                key={`${card.type}-${card.id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`card-bg rounded-xl p-6 border-4 ${getRarityClass(card.rarity)} hover:scale-105 transition-transform`}
              >
                <div className="text-center mb-4">
                  {card.imageUrl && (
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className="w-full h-48 object-cover rounded-lg mb-4 border-2 border-white/20"
                    />
                  )}
                  <h3 className="text-xl font-bold text-white mb-2">{card.name}</h3>
                  <div className="text-sm font-semibold text-crossover-gold capitalize mb-1">
                    {card.rarity}
                  </div>
                  <div className="text-xs text-white/70 mb-2">{card.franchise}</div>
                  <div className="text-xs text-white/60 mb-2">{card.type}</div>
                  {card.description && (
                    <p className="text-sm text-white/80 mb-4 line-clamp-2">{card.description}</p>
                  )}
                  {card.type === "Character" && card.power && (
                    <div className="flex justify-center gap-4 text-xs text-white/70 mb-4">
                      <div>⚔️ {card.power}</div>
                      <div>🛡️ {card.defense}</div>
                      <div>⚡ {card.speed}</div>
                    </div>
                  )}
                  <div className="text-xs text-white/50">
                    Unlocked: {new Date(card.unlockedAt).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

