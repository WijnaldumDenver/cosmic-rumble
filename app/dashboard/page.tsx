import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      unlockedCards: true,
    },
  })

  if (!user) {
    redirect("/auth/signin")
  }

  const unlockedCount = user.unlockedCards.length
  const winRate = user.gamesPlayed > 0 
    ? ((user.gamesWon / user.gamesPlayed) * 100).toFixed(1)
    : "0.0"

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Rank Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Rank</h2>
            <div className="text-3xl font-bold capitalize">{user.rank}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Current rank
            </p>
          </div>

          {/* Verse Coins */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Verse Coins</h2>
            <div className="text-3xl font-bold">{user.verseCoins}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Available balance
            </p>
          </div>

          {/* Games Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Games</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Played:</span>
                <span className="font-bold">{user.gamesPlayed}</span>
              </div>
              <div className="flex justify-between">
                <span>Won:</span>
                <span className="font-bold text-green-600">{user.gamesWon}</span>
              </div>
              <div className="flex justify-between">
                <span>Lost:</span>
                <span className="font-bold text-red-600">{user.gamesLost}</span>
              </div>
              <div className="flex justify-between">
                <span>Win Rate:</span>
                <span className="font-bold">{winRate}%</span>
              </div>
            </div>
          </div>

          {/* Unlocked Cards */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Collection</h2>
            <div className="text-3xl font-bold">{unlockedCount}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Cards unlocked
            </p>
          </div>

          {/* Penalty Status */}
          {user.penaltyUntil && user.penaltyUntil > new Date() && (
            <div className="bg-red-100 dark:bg-red-900 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-red-800 dark:text-red-200">
                Penalty Active
              </h2>
              <p className="text-sm">
                You cannot join games until{" "}
                {user.penaltyUntil.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/game/lobby"
            className="bg-blue-600 text-white rounded-lg p-6 text-center hover:bg-blue-700 transition"
          >
            <h3 className="text-xl font-semibold mb-2">Find Game</h3>
            <p className="text-sm opacity-90">Join or create a game</p>
          </Link>

          <Link
            href="/wheel"
            className="bg-purple-600 text-white rounded-lg p-6 text-center hover:bg-purple-700 transition"
          >
            <h3 className="text-xl font-semibold mb-2">Weekly Wheel</h3>
            <p className="text-sm opacity-90">Spin for free cards</p>
          </Link>

          <Link
            href="/collection"
            className="bg-green-600 text-white rounded-lg p-6 text-center hover:bg-green-700 transition"
          >
            <h3 className="text-xl font-semibold mb-2">Collection</h3>
            <p className="text-sm opacity-90">View your cards</p>
          </Link>

          {session.user.role === "Admin" && (
            <Link
              href="/admin"
              className="bg-orange-600 text-white rounded-lg p-6 text-center hover:bg-orange-700 transition"
            >
              <h3 className="text-xl font-semibold mb-2">Admin Panel</h3>
              <p className="text-sm opacity-90">Manage game</p>
            </Link>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Match history coming soon...
          </p>
        </div>
      </div>
    </div>
  )
}

