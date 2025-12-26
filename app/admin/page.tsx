import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user || user.role !== "Admin") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen p-8 pb-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Card Management</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create, edit, and manage cards
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Manage Cards
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              View and manage users
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Manage Users
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Game Sessions</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Monitor active games
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              View Sessions
            </button>
          </div>
        </div>

        <div className="mt-8 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Admin panel features are being developed. Full functionality coming soon.
          </p>
        </div>
      </div>
    </div>
  )
}

