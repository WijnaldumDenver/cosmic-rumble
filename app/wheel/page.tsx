"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function WheelPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  const handleSpin = async () => {
    setSpinning(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch("/api/wheel/spin", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to spin wheel")
        setSpinning(false)
        return
      }

      // Simulate spin animation delay
      setTimeout(() => {
        setResult(data.card)
        setSpinning(false)
      }, 2000)
    } catch (err) {
      setError("An error occurred")
      setSpinning(false)
    }
  }

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

  return (
    <div className="min-h-screen p-8 pb-24 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <h1 className="text-5xl font-black text-center mb-8 bg-crossover-gradient bg-clip-text text-transparent">
          Weekly Wheel of Fortune
        </h1>

        <div className="card-bg rounded-xl p-8 border-2 border-crossover-secondary/30">
          {/* Wheel Visual */}
          <div className="relative w-64 h-64 mx-auto mb-8">
            <motion.div
              className="w-full h-full rounded-full border-8 border-crossover-secondary relative overflow-hidden bg-crossover-gradient"
              animate={spinning ? { rotate: 360 * 5 } : { rotate: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
            >
              <div className="absolute inset-0 flex items-center justify-center bg-crossover-dark/80 rounded-full m-2">
                <div className="text-center text-white">
                  {spinning ? (
                    <div className="text-2xl font-bold">Spinning...</div>
                  ) : result ? (
                    <div className="text-xl font-bold">{result.name}</div>
                  ) : (
                    <div className="text-lg">Ready to spin</div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Result Card */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`mb-6 p-6 rounded-xl border-4 ${getRarityClass(result.rarity)} card-bg`}
              >
                <div className="text-center">
                  <h2 className="text-3xl font-black mb-2 text-white">YOU UNLOCKED!</h2>
                  <div className="text-2xl font-bold mb-2 text-white">{result.name}</div>
                  <div className="text-lg capitalize font-semibold text-crossover-gold">{result.rarity}</div>
                  {result.imageUrl && (
                    <div className="relative w-32 h-32 mx-auto mt-4 rounded-lg overflow-hidden border-2 border-crossover-gold/50">
                      <Image
                        src={result.imageUrl}
                        alt={result.name}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/50 border-2 border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Spin Button */}
          <button
            onClick={handleSpin}
            disabled={spinning}
            className="w-full btn-epic py-4 rounded-xl text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {spinning ? "Spinning..." : "SPIN THE WHEEL"}
          </button>

          <p className="text-center text-sm text-white/80 mt-4">
            Spin once per week to unlock random cards!
          </p>
        </div>
      </div>
    </div>
  )
}

