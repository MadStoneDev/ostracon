import React from "react";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

import PostForm from "@/components/feed/post/post-form";

async function fetchUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  } else {
    return user;
  }
}

export default async function NewPostPage() {
  const currentUser = await fetchUser();

  return <PostForm currentUser={currentUser} isEditing={false} />;
}
