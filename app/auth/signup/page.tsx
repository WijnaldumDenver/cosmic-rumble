"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    realName: "",
    dateOfBirth: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          realName: formData.realName || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create account")
        return
      }

      router.push("/auth/signin")
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full card-bg rounded-xl p-8 border-2 border-crossover-gold/30">
        <h1 className="text-4xl font-black text-center mb-6 bg-crossover-gold bg-clip-text text-transparent">
          Join the Battle
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-900/50 border-2 border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-bold mb-2 text-white">
              Email *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-3 bg-crossover-dark/50 border-2 border-crossover-accent/30 rounded-lg focus:ring-2 focus:ring-crossover-accent focus:border-crossover-accent text-white placeholder-white/50"
            />
          </div>
          
          <div>
            <label htmlFor="username" className="block text-sm font-bold mb-2 text-white">
              Username *
            </label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              className="w-full px-4 py-3 bg-crossover-dark/50 border-2 border-crossover-accent/30 rounded-lg focus:ring-2 focus:ring-crossover-accent focus:border-crossover-accent text-white placeholder-white/50"
            />
          </div>
          
          <div>
            <label htmlFor="realName" className="block text-sm font-bold mb-2 text-white">
              Real Name (optional)
            </label>
            <input
              id="realName"
              type="text"
              value={formData.realName}
              onChange={(e) => setFormData({ ...formData, realName: e.target.value })}
              className="w-full px-4 py-3 bg-crossover-dark/50 border-2 border-crossover-accent/30 rounded-lg focus:ring-2 focus:ring-crossover-accent focus:border-crossover-accent text-white placeholder-white/50"
            />
          </div>
          
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-bold mb-2 text-white">
              Date of Birth (optional)
            </label>
            <input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="w-full px-4 py-3 bg-crossover-dark/50 border-2 border-crossover-accent/30 rounded-lg focus:ring-2 focus:ring-crossover-accent focus:border-crossover-accent text-white"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-bold mb-2 text-white">
              Password *
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full px-4 py-3 bg-crossover-dark/50 border-2 border-crossover-accent/30 rounded-lg focus:ring-2 focus:ring-crossover-accent focus:border-crossover-accent text-white placeholder-white/50"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-bold mb-2 text-white">
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              className="w-full px-4 py-3 bg-crossover-dark/50 border-2 border-crossover-accent/30 rounded-lg focus:ring-2 focus:ring-crossover-accent focus:border-crossover-accent text-white placeholder-white/50"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gold py-3 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Join Now"}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-white">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-crossover-gold hover:text-crossover-orange font-bold underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

