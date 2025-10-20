"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { authRateLimiter } from "@/utils/rate-limit";

function getUserFriendlyError(error: any): string {
  const errorMessages: Record<string, string> = {
    "Invalid login credentials": "Invalid verification code. Please try again.",
    "Email not confirmed":
      "Please verify your email address before logging in.",
    "Too many requests": "Too many attempts. Please try again later.",
  };

  return (
    errorMessages[error.message] || "Authentication failed. Please try again."
  );
}

export async function requestOTP(formData: { email: string }) {
  try {
    // Rate limiting
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

    // Send OTP - profile will be auto-created by database trigger
    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email,
      options: {
        shouldCreateUser: true,
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
      message: "Verification code sent to your email.",
    };
  } catch (error) {
    console.error("OTP request error:", error);
    return {
      error: "Unable to send verification code. Please try again.",
      success: false,
    };
  }
}

export async function verifyOTP(formData: { email: string; otp: string }) {
  try {
    // Rate limiting
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

    // Verify OTP
    const { data, error } = await supabase.auth.verifyOtp({
      email: formData.email,
      token: formData.otp,
      type: "email",
    });

    if (error) {
      return {
        error: getUserFriendlyError(error),
        success: false,
      };
    }

    if (!data.user) {
      return {
        error: "Authentication failed. Please try again.",
        success: false,
      };
    }

    // Detailed logging
    console.log("Verification Data:", {
      userId: data.user.id,
      email: data.user.email,
    });

    // Profile is guaranteed to exist due to database trigger
    // Check if user has completed profile setup (has username)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", data.user.id)
      .single();

    // Log profile query details
    console.log("Profile Query:", {
      profile,
      profileError,
    });

    // Redirect based on profile completion
    if (!profile?.username) {
      console.log("Redirecting to profile setup");
      revalidatePath("/profile/setup");
      redirect("/profile/setup");
    } else {
      console.log("Redirecting to explore");
      revalidatePath("/explore");
      redirect("/explore");
    }
  } catch (error) {
    // More detailed error logging
    console.error("Full OTP verification error:", error);

    // Allow Next.js redirects to pass through
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    // Capture and log any unexpected errors
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
      success: false,
    };
  }
}
