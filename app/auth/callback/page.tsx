"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.replace("/dashboard");
      } else {
        router.replace("/");
      }
    };

    handleRedirect();
  }, [router]);

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      Loading...
    </div>
  );
}
