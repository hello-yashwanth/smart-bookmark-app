# Smart Bookmark App

A simple bookmark manager built with Next.js, Supabase, and Tailwind CSS.

## 🚀 Features

- Google OAuth login (No email/password)
- Add bookmark (Title + URL)
- Delete bookmark
- Private bookmarks per user (Row Level Security)
- Real-time updates using Supabase Realtime
- Deployed on Vercel

---

## 🛠 Tech Stack

- Next.js (App Router)
- Supabase (Auth, Database, Realtime)
- Tailwind CSS
- Vercel (Deployment)

---

## 🔐 Authentication

Implemented Google OAuth using Supabase Auth.

---

## 🗄 Database

Table: `bookmarks`

Columns:
- id (uuid)
- title (text)
- url (text)
- user_id (uuid)
- created_at (timestamp)

Row Level Security enabled so users can only access their own bookmarks.

---

## 🔄 Real-time Implementation

Used Supabase Realtime subscription:

```ts
supabase
  .channel("realtime-bookmarks")
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
