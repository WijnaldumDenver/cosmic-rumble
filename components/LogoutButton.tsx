"use client"

import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/")
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded-lg font-bold text-sm bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white hover:from-red-700 hover:via-red-800 hover:to-red-900 transition-all shadow-lg hover:shadow-red-500/50 border border-red-500/30"
      title="Sign out"
    >
      Logout
    </button>
  )
}

