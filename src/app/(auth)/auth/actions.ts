"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { authRateLimiter } from "@/utils/rate-limit";

// Helper function to get user-friendly error message
function getUserFriendlyError(error: any): string {
  console.error("Authentication error details:", error);

  if (error.message?.includes("Invalid login credentials")) {
    return "Invalid verification code. Please try again.";
  }
  if (error.message?.includes("Email not confirmed")) {
    return "Please verify your email address before logging in.";
  }
  if (error.message?.includes("Too many requests")) {
    return "Too many attempts. Please try again later.";
  }

  return "Authentication failed. Please try again.";
}

export async function requestOTP(formData: { email: string }) {
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

    // Send OTP - shouldCreateUser:true will create an account if it doesn't exist
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
    console.error("Unexpected OTP request error:", error);
    return {
      error: "Unable to send verification code. Please try again.",
      success: false,
    };
  }
}

export async function verifyOTP(formData: { email: string; otp: string }) {
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

    // Verify the OTP
    const { error, data } = await supabase.auth.verifyOtp({
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

    // Ensure we have a valid user from auth
    if (!data.user || !data.user.id) {
      console.error("Missing user data after OTP verification:", data);
      return {
        error: "Authentication failed. User data is incomplete.",
        success: false,
      };
    }

    console.log("User authenticated successfully:", data.user.id);

    // First try to get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, email")
      .eq("id", data.user.id)
      .maybeSingle();

    // If profile doesn't exist, try to see if it's in a different table or has a different structure
    if (profileError || !profile) {
      console.log(
        "Profile not found in 'profiles' table, checking 'users' table...",
      );

      // Try to get the user from the users table if that's where your data is
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, username, email")
        .eq("id", data.user.id)
        .maybeSingle();

      if (userError || !user) {
        console.error("Error fetching user:", userError || "User not found");

        // Attempt to create a basic profile (adjust fields based on your schema)
        try {
          const { error: insertError } = await supabase
            .from(profileError ? "users" : "profiles") // Try the table that seems most appropriate
            .insert({
              id: data.user.id,
              email: data.user.email,
              created_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error("Error creating user record:", insertError);
            return {
              error:
                "Account verified but profile creation failed. Please contact support.",
              success: false,
            };
          }
        } catch (err) {
          console.error("Exception during profile creation:", err);
          return {
            error:
              "Account verified but profile setup failed. Please try again.",
            success: false,
          };
        }

        revalidatePath("/profile/setup");
        redirect("/profile/setup");
      }

      // If we found the user in the users table
      if (user?.username) {
        revalidatePath("/explore");
        redirect("/explore");
      } else {
        revalidatePath("/profile/setup");
        redirect("/profile/setup");
      }
    }

    // If code reaches here, we found a profile in the profiles table
    console.log("Profile found:", profile);

    if (!profile.username) {
      revalidatePath("/profile/setup");
      redirect("/profile/setup");
    } else {
      revalidatePath("/explore");
      redirect("/explore");
    }

    // This return is for TypeScript, it will never be reached due to redirects
    return {
      error: null,
      success: true,
    };
  } catch (error) {
    if (error instanceof Error && !error.message.includes("NEXT_REDIRECT")) {
      console.error("Unexpected OTP verification error:", error);
      return {
        error: "An unexpected error occurred. Please try again.",
        success: false,
      };
    }

    throw error;
  }
}
