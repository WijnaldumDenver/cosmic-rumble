import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen p-8 pb-24 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl md:text-8xl font-black mb-4 bg-crossover-gradient bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,0,110,0.8)]">
          UniRumble
        </h1>
        <p className="text-2xl md:text-3xl font-bold mb-12 text-white">
          THE ULTIMATE CROSSOVER EVENT
        </p>
        <p className="text-lg md:text-xl mb-12 text-white/90 max-w-2xl mx-auto">
          Characters from every universe collide in the most epic card battle ever created!
        </p>
        
        {session ? (
          <div className="space-y-6">
            <p className="text-xl font-semibold text-white">Welcome, {session.user.username}!</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-8 py-4 btn-epic text-white rounded-xl font-bold text-lg hover:scale-105 transition-transform"
              >
                Dashboard
              </Link>
              <Link
                href="/game/lobby"
                className="px-8 py-4 btn-gold text-white rounded-xl font-bold text-lg hover:scale-105 transition-transform"
              >
                Find Game
              </Link>
              {session.user.role === "Admin" && (
                <Link
                  href="/admin"
                  className="px-8 py-4 btn-blue text-white rounded-xl font-bold text-lg hover:scale-105 transition-transform"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/auth/signin"
                className="px-8 py-4 btn-epic text-white rounded-xl font-bold text-lg hover:scale-105 transition-transform"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-8 py-4 btn-gold text-white rounded-xl font-bold text-lg hover:scale-105 transition-transform"
              >
                Join the Battle
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

