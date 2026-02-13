"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  user_id: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

 
  const fetchBookmarks = async (userId: string) => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId);

    if (!error && data) {
      setBookmarks(data);
    }
  };

 
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/";
      } else {
        setUser(data.user);
        fetchBookmarks(data.user.id);
      }
    };

    getUser();
  }, []);

  
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchBookmarks(user.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);


  const addBookmark = async () => {
    if (!title || !url || !user) return;

    await supabase.from("bookmarks").insert([
      {
        title,
        url,
        user_id: user.id,
      },
    ]);

    setTitle("");
    setUrl("");
  };


  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (!user) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl">Welcome {user.email}</h1>

        <button
          onClick={handleLogout}
          className="bg-red-600 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="mb-6 space-y-3">
        <input
          type="text"
          placeholder="Title"
          className="p-2 rounded bg-gray-800 w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="URL"
          className="p-2 rounded bg-gray-800 w-full"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button
          onClick={addBookmark}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Add Bookmark
        </button>
      </div>

      <div className="space-y-3">
        {bookmarks.length === 0 && (
          <p className="text-gray-400">No bookmarks yet.</p>
        )}

        {bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="bg-gray-900 p-4 rounded flex justify-between"
          >
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400"
            >
              {bookmark.title}
            </a>

            <button
              onClick={() => deleteBookmark(bookmark.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
