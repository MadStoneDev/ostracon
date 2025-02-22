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
    const { data: existingUser, error: usernameCheckError } = await supabase
      .from("users")
      .select("username")
      .eq("username", formData.username)
      .single();

    if (usernameCheckError) {
      console.error(`Username check error: ${usernameCheckError}`);
      return {
        error: `Unable to verify username availability. Please try again.`,
        success: false,
      };
    }

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
      console.error(`Signup error: ${signUpError}`);

      const userMessage = (() => {
        switch (signUpError.message) {
          case "User already registered":
            return "This email is already registered. Please try logging in instead.";
          case "Password should be at least 8 characters":
            return "Please choose a longer password.";
          case "Unable to validate email address: invalid format":
            return "Please enter a valid email address.";
          default:
            // Log unknown errors but give generic message to user
            console.error("Unknown signup error:", signUpError);
            return "Unable to create account. Please try again later.";
        }
      })();

      return {
        error: userMessage,
        success: false,
      };
    }

    if (!authData.user) {
      console.error(`No user data returned from sign up`);
      return {
        error: "Unable to create account. Please try again later.",
        success: false,
      };
    }

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
      console.error("Profile creation error:", profileError);

      if (
        profileError.message.includes("row-level security") ||
        profileError.message.includes("permission denied")
      ) {
        console.error("RLS or permission error:", profileError);
        return {
          error: "Unable to complete registration. Please try again later.",
          success: false,
        };
      }

      return {
        error: `Unable to create profile. Please try again later.`,
        success: false,
      };
    }

    revalidatePath("/");
    redirect("/auth/check-email");
  } catch (error) {
    console.error("Unexpected registration error:", error);
    return {
      error: "An unexpected error occurred. Please try again later.",
      success: false,
    };
  }
}
