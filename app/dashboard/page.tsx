import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LogoutButton } from "@/components/LogoutButton"

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
    <div className="min-h-screen p-8 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-black bg-crossover-gradient bg-clip-text text-transparent">
            Command Center
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-white/80 text-sm">Welcome, {session.user.username}</span>
            <LogoutButton />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Rank Card */}
          <div className="card-bg rounded-xl p-6 border-2 border-crossover-gold/30">
            <h2 className="text-xl font-bold mb-4 text-white">Rank</h2>
            <div className="text-4xl font-black capitalize text-crossover-gold drop-shadow-[0_0_10px_rgba(255,190,11,0.8)]">
              {user.rank}
            </div>
            <p className="text-sm text-white/80 mt-2">
              Current rank
            </p>
          </div>

          {/* Verse Coins */}
          <div className="card-bg rounded-xl p-6 border-2 border-crossover-accent/30">
            <h2 className="text-xl font-bold mb-4 text-white">Verse Coins</h2>
            <div className="text-4xl font-black text-crossover-accent drop-shadow-[0_0_10px_rgba(58,134,255,0.8)]">
              {user.verseCoins}
            </div>
            <p className="text-sm text-white/80 mt-2">
              Available balance
            </p>
          </div>

          {/* Games Stats */}
          <div className="card-bg rounded-xl p-6 border-2 border-crossover-primary/30">
            <h2 className="text-xl font-bold mb-4 text-white">Battle Stats</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-white">
                <span>Played:</span>
                <span className="font-bold">{user.gamesPlayed}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Won:</span>
                <span className="font-bold text-green-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]">{user.gamesWon}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Lost:</span>
                <span className="font-bold text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.8)]">{user.gamesLost}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Win Rate:</span>
                <span className="font-bold text-crossover-gold drop-shadow-[0_0_5px_rgba(255,190,11,0.8)]">{winRate}%</span>
              </div>
            </div>
          </div>

          {/* Unlocked Cards */}
          <div className="card-bg rounded-xl p-6 border-2 border-crossover-secondary/30">
            <h2 className="text-xl font-bold mb-4 text-white">Collection</h2>
            <div className="text-4xl font-black text-crossover-secondary drop-shadow-[0_0_10px_rgba(131,56,236,0.8)]">
              {unlockedCount}
            </div>
            <p className="text-sm text-white/80 mt-2">
              Cards unlocked
            </p>
          </div>

          {/* Penalty Status */}
          {user.penaltyUntil && user.penaltyUntil > new Date() && (
            <div className="card-bg rounded-xl p-6 border-2 border-red-500/50 bg-red-900/20">
              <h2 className="text-xl font-bold mb-4 text-red-300">
                Penalty Active
              </h2>
              <p className="text-sm text-white">
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
            className="btn-blue rounded-xl p-6 text-center text-white hover:scale-105 transition-transform"
          >
            <h3 className="text-xl font-bold mb-2">Find Game</h3>
            <p className="text-sm opacity-90">Join or create a game</p>
          </Link>

          <Link
            href="/wheel"
            className="btn-epic rounded-xl p-6 text-center text-white hover:scale-105 transition-transform"
          >
            <h3 className="text-xl font-bold mb-2">Weekly Wheel</h3>
            <p className="text-sm opacity-90">Spin for free cards</p>
          </Link>

          <Link
            href="/shop"
            className="btn-epic rounded-xl p-6 text-center text-white hover:scale-105 transition-transform"
          >
            <h3 className="text-xl font-bold mb-2">Card Shop</h3>
            <p className="text-sm opacity-90">Buy cards with Verse Coins</p>
          </Link>

          <Link
            href="/collection"
            className="btn-gold rounded-xl p-6 text-center text-white hover:scale-105 transition-transform"
          >
            <h3 className="text-xl font-bold mb-2">Collection</h3>
            <p className="text-sm opacity-90">View your cards</p>
          </Link>

          {session.user.role === "Admin" && (
            <Link
              href="/admin"
              className="bg-gradient-to-br from-crossover-orange to-crossover-gold rounded-xl p-6 text-center text-white hover:scale-105 transition-transform shadow-crossover-glow-gold"
            >
              <h3 className="text-xl font-bold mb-2">Admin Panel</h3>
              <p className="text-sm opacity-90">Manage game</p>
            </Link>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card-bg rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-white">Recent Activity</h2>
          <p className="text-white/80">
            Match history coming soon...
          </p>
        </div>
      </div>
    </div>
  )
}

