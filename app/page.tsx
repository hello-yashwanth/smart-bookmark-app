"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAndRedirect = (session: { user: unknown } | null) => {
      if (session) router.replace("/dashboard");
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
        checkAndRedirect(session);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      checkAndRedirect(data.session);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black">
      <button
        onClick={handleLogin}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Sign in with Google
      </button>
    </div>
  );
}
