"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.push("/dashboard");
      }
    };

    checkSession();
  }, [router]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://smart-bookmark-app-ochre.vercel.app",
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
