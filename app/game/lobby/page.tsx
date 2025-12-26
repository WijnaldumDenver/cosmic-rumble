"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GameLobbyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchGames();
      // Refresh games every 5 seconds
      const interval = setInterval(fetchGames, 5000);
      return () => clearInterval(interval);
    }
  }, [status, router]);

  const fetchGames = async () => {
    try {
      const response = await fetch("/api/game/list");
      if (response.ok) {
        const data = await response.json();
        setGames(data.games || []);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setLoading(false);
    }
  };

  const createGame = async () => {
    setCreating(true);
    try {
      const response = await fetch("/api/game/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxPlayers: 4 }),
      });

      const data = await response.json();
      if (response.ok) {
        router.push(`/game/${data.gameSession.id}`);
      } else {
        alert(data.error || "Failed to create game");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setCreating(false);
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black mb-8 bg-crossover-gradient bg-clip-text text-transparent">
          Battle Arena
        </h1>

        <div className="mb-6">
          <button
            onClick={createGame}
            disabled={creating}
            className="btn-gold px-8 py-4 rounded-xl text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "Create New Battle"}
          </button>
        </div>

        <div className="card-bg rounded-xl p-6 border-2 border-crossover-accent/30">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Available Games</h2>
            <button
              onClick={fetchGames}
              className="px-4 py-2 bg-crossover-dark/50 text-white rounded-lg hover:bg-crossover-dark transition-all text-sm font-semibold"
            >
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-white/80">
              Loading games...
            </div>
          ) : games.length === 0 ? (
            <p className="text-white/80 text-center py-8">
              No games available. Create a game to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="bg-crossover-dark/50 rounded-lg p-4 border-2 border-crossover-primary/30 hover:border-crossover-primary/50 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-white">
                          {game.host}&apos;s Battle
                        </h3>
                        <span className="px-2 py-1 bg-crossover-accent/20 text-crossover-accent rounded text-xs font-semibold">
                          {game.currentPlayers}/{game.maxPlayers} Players
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-white/70">
                        <span>Host: {game.host}</span>
                        {game.players.length > 0 && (
                          <span>
                            Players:{" "}
                            {game.players
                              .map((p: any) => p.username)
                              .join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch("/api/game/join", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ gameSessionId: game.id }),
                          });

                          const data = await response.json();
                          if (response.ok) {
                            router.push(`/game/${game.id}`);
                          } else {
                            alert(data.error || "Failed to join game");
                            fetchGames(); // Refresh list
                          }
                        } catch (error) {
                          alert("An error occurred");
                        }
                      }}
                      disabled={
                        game.currentPlayers >= game.maxPlayers ||
                        game.players.some(
                          (p: any) => p.id === session?.user?.id
                        )
                      }
                      className="px-6 py-2 bg-gradient-to-br from-crossover-accent to-crossover-primary text-white rounded-lg font-bold hover:shadow-crossover-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {game.players.some((p: any) => p.id === session?.user?.id)
                        ? "Joined"
                        : game.currentPlayers >= game.maxPlayers
                        ? "Full"
                        : "Join"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
