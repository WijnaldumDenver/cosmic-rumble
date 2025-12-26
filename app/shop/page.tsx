"use client"

import { useState, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"

interface Card {
  id: string
  name: string
  imageUrl: string
  rarity: string
  franchise: string
  description?: string
  shopPrice: number | null
  type: "Character" | "Item" | "Battlefield"
  power?: number
  defense?: number
  speed?: number
}

export default function ShopPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [userCoins, setUserCoins] = useState(0)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Filters and search
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRarity, setSelectedRarity] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedFranchise, setSelectedFranchise] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"name" | "price" | "rarity">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (session) {
      fetchShopData()
    }
  }, [session, status, router])

  const fetchShopData = async () => {
    try {
      const [cardsRes, userRes] = await Promise.all([
        fetch("/api/shop/cards"),
        fetch("/api/shop/user"),
      ])

      if (cardsRes.ok) {
        const cardsData = await cardsRes.json()
        setCards(cardsData.cards || [])
      }

      if (userRes.ok) {
        const userData = await userRes.json()
        setUserCoins(userData.verseCoins || 0)
      }
    } catch (err) {
      console.error("Error fetching shop data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (cardId: string, cardType: string, price: number) => {
    if (userCoins < price) {
      setError("Insufficient Verse Coins!")
      setTimeout(() => setError(""), 3000)
      return
    }

    setPurchasing(cardId)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/shop/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, cardType }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to purchase card")
        setTimeout(() => setError(""), 3000)
        return
      }

      setSuccess(`Successfully purchased ${data.card.name}!`)
      setUserCoins(userCoins - price)
      setTimeout(() => setSuccess(""), 3000)

      // Remove purchased card from list
      setCards((prev) => prev.filter((c) => !(c.id === cardId && c.type === cardType)))
    } catch (err) {
      setError("An error occurred")
      setTimeout(() => setError(""), 3000)
    } finally {
      setPurchasing(null)
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
      // Only show cards available in shop
      if (card.shopPrice === null) return false

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
        case "price":
          comparison = (a.shopPrice || 0) - (b.shopPrice || 0)
          break
        case "rarity":
          const rarityOrder = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythical"]
          comparison = rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity)
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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-2xl">Loading shop...</div>
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
            Card Shop
          </h1>
          <div className="card-bg rounded-xl px-6 py-3 border-2 border-crossover-gold/30">
            <div className="text-sm text-white/70 font-semibold">Your Balance</div>
            <div className="text-2xl font-black text-crossover-gold">
              {userCoins.toLocaleString()} VC
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/50 border-2 border-red-500/50 text-red-200 px-6 py-4 rounded-xl mb-6"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-900/50 border-2 border-green-500/50 text-green-200 px-6 py-4 rounded-xl mb-6"
          >
            {success}
          </motion.div>
        )}

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
                placeholder="Search cards..."
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
                onChange={(e) => setSortBy(e.target.value as "name" | "price" | "rarity")}
                className="w-full px-4 py-3 bg-crossover-dark/50 border-2 border-crossover-accent/30 rounded-lg focus:ring-2 focus:ring-crossover-accent text-white"
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="rarity">Rarity</option>
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
            Showing {filteredAndSortedCards.length} of {cards.filter((c) => c.shopPrice !== null).length} available cards
          </div>
        </div>

        {/* Cards Grid */}
        {filteredAndSortedCards.length === 0 ? (
          <div className="card-bg rounded-xl p-12 text-center border-2 border-crossover-primary/30">
            <div className="text-2xl font-bold text-white mb-2">No cards found</div>
            <div className="text-white/70">Try adjusting your filters</div>
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
                    <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden border-2 border-white/20">
                      <Image
                        src={card.imageUrl}
                        alt={card.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mb-2">{card.name}</h3>
                  <div className="text-sm font-semibold text-crossover-gold capitalize mb-1">
                    {card.rarity}
                  </div>
                  <div className="text-xs text-white/70 mb-2">{card.franchise}</div>
                  <div className="text-xs text-white/60 mb-4">{card.type}</div>
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
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-black text-crossover-gold">
                    {card.shopPrice?.toLocaleString()} VC
                  </div>
                  <button
                    onClick={() => handlePurchase(card.id, card.type, card.shopPrice!)}
                    disabled={purchasing === `${card.type}-${card.id}` || userCoins < (card.shopPrice || 0)}
                    className="btn-gold px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {purchasing === `${card.type}-${card.id}` ? "Buying..." : "Buy"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

