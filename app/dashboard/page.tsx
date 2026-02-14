"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const handleSession = async () => {
      // 🔥 This automatically reads #access_token from URL
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.replace("/dashboard");
      }
    };

    handleSession();
  }, [router]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black">
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-6 py-3 rounded"
      >
        Sign in with Google
      </button>
    </div>
  );
}
