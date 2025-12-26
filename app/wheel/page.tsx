"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

export default function WheelPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  if (!session) {
    router.push("/auth/signin")
    return null
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
    <div className="min-h-screen p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8">Weekly Wheel</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Wheel Visual */}
          <div className="relative w-64 h-64 mx-auto mb-8">
            <motion.div
              className="w-full h-full rounded-full border-8 border-gray-300 relative overflow-hidden"
              animate={spinning ? { rotate: 360 * 5 } : { rotate: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
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
                className={`mb-6 p-6 rounded-lg border-4 ${getRarityClass(result.rarity)}`}
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">You unlocked!</h2>
                  <div className="text-xl font-semibold mb-2">{result.name}</div>
                  <div className="text-sm capitalize">{result.rarity}</div>
                  {result.imageUrl && (
                    <img
                      src={result.imageUrl}
                      alt={result.name}
                      className="w-32 h-32 mx-auto mt-4 rounded"
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Spin Button */}
          <button
            onClick={handleSpin}
            disabled={spinning}
            className="w-full bg-purple-600 text-white py-4 rounded-lg text-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {spinning ? "Spinning..." : "Spin the Wheel"}
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            Spin once per week to unlock random cards!
          </p>
        </div>
      </div>
    </div>
  )
}

