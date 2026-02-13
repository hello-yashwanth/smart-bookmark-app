"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  return (
    <div
      className="h-screen flex items-center justify-center bg-cover bg-center"
     style={{ backgroundImage: "url('/background.jpg')" }}



    >
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg cursor-pointer "
      >
        Sign in with Google
      </button>
    </div>
  );
}
