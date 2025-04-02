"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { authRateLimiter } from "@/utils/rate-limit";

// Helper function to get user-friendly error message
function getUserFriendlyError(error: any): string {
  console.error("Authentication error details:", error);

  // Map specific Supabase error codes/messages to user-friendly messages
  if (error.message?.includes("Invalid login credentials")) {
    return "Invalid email or password. Please try again.";
  }
  if (error.message?.includes("Email not confirmed")) {
    return "Please verify your email address before logging in.";
  }
  if (error.message?.includes("Too many requests")) {
    return "Too many login attempts. Please try again later.";
  }

  // Default generic message
  return "Login failed. Please try again.";
}

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

    const { error, data } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      return {
        error: getUserFriendlyError(error),
        success: false,
      };
    }

    revalidatePath("/");
    redirect("/explore");
  } catch (error) {
    if (error instanceof Error && !error.message.includes("NEXT_REDIRECT")) {
      console.error("Unexpected login error:", error);
      return {
        error: "An unexpected error occurred. Please try again.",
        success: false,
      };
    }

    throw error;
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
        shouldCreateUser: false,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/explore`,
      },
    });

    if (error) {
      return {
        error: getUserFriendlyError(error),
        success: false,
      };
    }

    return {
      error: null,
      success: true,
      message: "Check your email for the login link.",
    };
  } catch (error) {
    console.error("Unexpected magic link error:", error);
    return {
      error: "Unable to send login link. Please try again.",
      success: false,
    };
  }
}
