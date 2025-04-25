"use client";

import React from "react";
import PostForm from "@/components/feed/post/post-form";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NewPostPage() {
  const supabase = createClient();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [supabase, router]);

  if (isAuthenticated === null) {
    return <div className="p-4">Loading...</div>;
  }

  return <PostForm isEditing={false} />;
}
