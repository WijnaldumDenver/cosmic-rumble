import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">UniRumble</h1>
        <p className="text-xl text-center mb-8">
          Fast-paced crossover card game where characters battle!
        </p>
        
        {session ? (
          <div className="text-center space-y-4">
            <p>Welcome, {session.user.username}!</p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Dashboard
              </Link>
              <Link
                href="/game/lobby"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Find Game
              </Link>
              {session.user.role === "Admin" && (
                <Link
                  href="/admin"
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/signin"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

