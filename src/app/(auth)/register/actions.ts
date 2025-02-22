"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { authRateLimiter } from "@/utils/rate-limit";

type RegisterResponse = {
  error: string | null;
  success: boolean;
};

export async function register(formData: {
  username: string;
  email: string;
  password: string;
}): Promise<RegisterResponse> {
  try {
    // Rate limiting check
    const { success: rateLimit } = await authRateLimiter.limit(
      formData.email.toLowerCase(),
    );

    if (!rateLimit) {
      return {
        error: "Too many requests. Please try again later.",
        success: false,
      };
    }

    const supabase = await createClient();

    // Check if username exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("username")
      .eq("username", formData.username)
      .single();

    if (existingUser) {
      return {
        error: "Username is already taken",
        success: false,
      };
    }

    // Signup user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          username: formData.username,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (signUpError) {
      return {
        error: signUpError.message,
        success: false,
      };
    }

    if (authData.user) {
      // Create user profile
      const { error: profileError } = await supabase.from("users").insert([
        {
          id: authData.user.id,
          username: formData.username,
          avatar_url: null,
          bio: null,
          queued_for_delete: false,
          is_moderator: false,
        },
      ]);

      if (profileError) {
        return {
          error: profileError.message,
          success: false,
        };
      }

      revalidatePath("/");
      redirect("/auth/check-email");
    }

    return {
      error: "Failed to create user",
      success: false,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
      success: false,
    };
  }
}
