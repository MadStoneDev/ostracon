"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/server";
import { authRateLimiter } from "@/utils/rate-limit";

export async function loginWithPassword(formData: {
  email: string;
  password: string;
}) {
  try {
    // Rate limiting check
    const { success: rateLimit } = await authRateLimiter.limit(
      formData.email.toLowerCase(),
    );

    if (!rateLimit) {
      return {
        error: "Too many attempts. Please try again later.",
        success: false,
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      return {
        error: error.message,
        success: false,
      };
    }

    revalidatePath("/");
    redirect("/explore");
  } catch (error) {
    console.error("Login error:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
      success: false,
    };
  }
}

export async function loginWithMagicLink(formData: { email: string }) {
  try {
    const { success: rateLimit } = await authRateLimiter.limit(
      formData.email.toLowerCase(),
    );

    if (!rateLimit) {
      return {
        error: "Too many attempts. Please try again later.",
        success: false,
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      return {
        error: error.message,
        success: false,
      };
    }

    return {
      error: null,
      success: true,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
      success: false,
    };
  }
}
