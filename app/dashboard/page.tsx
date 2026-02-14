"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  user_id: string;
  created_at: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchBookmarks = async (userId: string) => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) setBookmarks(data || []);
    setLoading(false);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/");
        return;
      }
      setUser({ id: data.session.user.id });
      await fetchBookmarks(data.session.user.id);
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("realtime-bookmarks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchBookmarks(user.id)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle.trim() || !newUrl.trim()) return;

    setAdding(true);
    await supabase.from("bookmarks").insert({
      title: newTitle.trim(),
      url: newUrl.trim(),
      user_id: user.id,
    });
    setNewTitle("");
    setNewUrl("");
    setAdding(false);
    await fetchBookmarks(user.id);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
    if (user) await fetchBookmarks(user.id);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">My Bookmarks</h1>
          <button
            onClick={handleSignOut}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Sign out
          </button>
        </div>

        <form onSubmit={handleAdd} className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="url"
            placeholder="https://example.com"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={adding}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Add
          </button>
        </form>

        <ul className="space-y-3">
          {bookmarks.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between bg-gray-900 rounded-lg p-4 border border-gray-800"
            >
              <div className="min-w-0 flex-1">
                <a
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline truncate block font-medium"
                >
                  {b.title}
                </a>
                <p className="text-gray-500 text-sm truncate">{b.url}</p>
              </div>
              <button
                onClick={() => handleDelete(b.id)}
                className="ml-4 text-red-500 hover:text-red-400 shrink-0 transition-colors"
                aria-label="Delete bookmark"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        {bookmarks.length === 0 && (
          <p className="text-gray-500 text-center py-12">
            No bookmarks yet. Add one above!
          </p>
        )}
      </div>
    </div>
  );
}
