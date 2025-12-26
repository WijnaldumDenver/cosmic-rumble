"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full card-bg rounded-xl p-8 border-2 border-crossover-primary/30">
        <h1 className="text-4xl font-black text-center mb-6 bg-crossover-gradient bg-clip-text text-transparent">
          Enter the Arena
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-900/50 border-2 border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-bold mb-2 text-white">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-crossover-dark/50 border-2 border-crossover-accent/30 rounded-lg focus:ring-2 focus:ring-crossover-accent focus:border-crossover-accent text-white placeholder-white/50"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-bold mb-2 text-white">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-crossover-dark/50 border-2 border-crossover-accent/30 rounded-lg focus:ring-2 focus:ring-crossover-accent focus:border-crossover-accent text-white placeholder-white/50"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-epic py-3 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entering..." : "Sign In"}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-white">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-crossover-gold hover:text-crossover-orange font-bold underline">
            Join the Battle
          </Link>
        </p>
      </div>
    </div>
  )
}

