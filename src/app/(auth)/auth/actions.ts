"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { authRateLimiter } from "@/utils/rate-limit";

// Helper function to get user-friendly error message
function getUserFriendlyError(error: any): string {
  console.error(
    "Authentication error details:",
    JSON.stringify(error, null, 2),
  );

  if (error.message?.includes("Invalid login credentials")) {
    return "Invalid verification code. Please try again.";
  }
  if (error.message?.includes("Email not confirmed")) {
    return "Please verify your email address before logging in.";
  }
  if (error.message?.includes("Too many requests")) {
    return "Too many attempts. Please try again later.";
  }

  return `Authentication failed: ${
    error.message || "Unknown error"
  }. Please try again.`;
}

export async function requestOTP(formData: { email: string }) {
  console.log("📧 OTP REQUEST STARTED for email:", formData.email);

  try {
    // Rate limiting check
    console.log("🔒 Checking rate limit...");
    const { success: rateLimit } = await authRateLimiter.limit(
      formData.email.toLowerCase(),
    );
    console.log("🔒 Rate limit result:", rateLimit);

    if (!rateLimit) {
      console.log("⛔ Rate limit exceeded for:", formData.email);
      return {
        error: "Too many attempts. Please try again later.",
        success: false,
      };
    }

    console.log("🔌 Creating Supabase client...");
    const supabase = await createClient();
    console.log("✅ Supabase client created");

    // Send OTP - shouldCreateUser:true will create an account if it doesn't exist
    console.log("📤 Sending OTP email with shouldCreateUser=true...");
    const signInResult = await supabase.auth.signInWithOtp({
      email: formData.email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/explore`,
      },
    });

    if (signInResult.error) {
      console.error("❌ OTP send failed:", signInResult.error);
      return {
        error: getUserFriendlyError(signInResult.error),
        success: false,
      };
    }

    console.log("✅ OTP sent successfully!");
    return {
      error: null,
      success: true,
      message: "Verification code sent to your email.",
    };
  } catch (error) {
    console.error("💥 Unexpected OTP request error:", error);
    return {
      error: "Unable to send verification code. Please try again.",
      success: false,
    };
  }
}

export async function verifyOTP(formData: { email: string; otp: string }) {
  console.log("🔑 OTP VERIFICATION STARTED for email:", formData.email);
  console.log("📝 OTP length:", formData.otp?.length || 0);

  try {
    console.log("🔒 Checking rate limit...");
    const { success: rateLimit } = await authRateLimiter.limit(
      formData.email.toLowerCase(),
    );
    console.log("🔒 Rate limit result:", rateLimit);

    if (!rateLimit) {
      console.log("⛔ Rate limit exceeded for:", formData.email);
      return {
        error: "Too many attempts. Please try again later.",
        success: false,
      };
    }

    console.log("🔌 Creating Supabase client...");
    const supabase = await createClient();
    console.log("✅ Supabase client created");

    // Verify the OTP
    console.log("🔐 Verifying OTP...");
    const verifyResult = await supabase.auth.verifyOtp({
      email: formData.email,
      token: formData.otp,
      type: "email",
    });

    if (verifyResult.error) {
      console.error("❌ OTP verification failed:", verifyResult.error);
      return {
        error: getUserFriendlyError(verifyResult.error),
        success: false,
      };
    }

    console.log("✅ OTP verified successfully!");

    // Log the full user data for debugging
    console.log(
      "👤 User data received:",
      JSON.stringify(verifyResult.data, null, 2),
    );

    // Ensure we have a valid user from auth
    if (!verifyResult.data.user || !verifyResult.data.user.id) {
      console.error(
        "❌ Missing user data after OTP verification:",
        verifyResult.data,
      );
      return {
        error: "Authentication failed. User data is incomplete.",
        success: false,
      };
    }

    console.log(
      "✅ User authenticated successfully, ID:",
      verifyResult.data.user.id,
    );

    // First try to get the user's profile
    console.log("🔍 Looking for user profile in 'profiles' table...");
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, email")
      .eq("id", verifyResult.data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("❌ Error fetching profile:", profileError);
    } else if (!profile) {
      console.log("ℹ️ No profile found in 'profiles' table");
    } else {
      console.log("✅ Profile found in 'profiles' table:", profile);
    }

    // If profile doesn't exist, try to see if it's in a different table or has a different structure
    if (profileError || !profile) {
      console.log("🔍 Looking for user in 'users' table...");

      // Try to get the user from the users table if that's where your data is
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, username, email")
        .eq("id", verifyResult.data.user.id)
        .maybeSingle();

      if (userError) {
        console.error("❌ Error fetching from 'users' table:", userError);
      } else if (!user) {
        console.log("ℹ️ No user found in 'users' table");
      } else {
        console.log("✅ User found in 'users' table:", user);
      }

      if (userError || !user) {
        console.log("🔨 No profile found. Attempting to create a profile...");
        console.log("📊 Target table:", profileError ? "users" : "profiles");

        // Attempt to create a basic profile (adjust fields based on your schema)
        try {
          const newUserData = {
            id: verifyResult.data.user.id,
            email: verifyResult.data.user.email,
            created_at: new Date().toISOString(),
          };
          console.log("📊 User data to insert:", newUserData);

          const { error: insertError, data: insertData } = await supabase
            .from(profileError ? "users" : "profiles") // Try the table that seems most appropriate
            .insert(newUserData)
            .select();

          if (insertError) {
            console.error("❌ Error creating user record:", insertError);
            return {
              error:
                "Account verified but profile creation failed. Please contact support.",
              success: false,
            };
          }

          console.log("✅ New profile created:", insertData);
        } catch (err) {
          console.error("💥 Exception during profile creation:", err);
          return {
            error:
              "Account verified but profile setup failed. Please try again.",
            success: false,
          };
        }

        console.log("🔀 Redirecting to profile setup...");
        revalidatePath("/profile/setup");
        redirect("/profile/setup");
      }

      // If we found the user in the users table
      if (user?.username) {
        console.log("🔀 User has username, redirecting to explore...");
        revalidatePath("/explore");
        redirect("/explore");
      } else {
        console.log(
          "🔀 User needs to set username, redirecting to profile setup...",
        );
        revalidatePath("/profile/setup");
        redirect("/profile/setup");
      }
    }

    // If code reaches here, we found a profile in the profiles table
    console.log("👤 Profile details:", profile);

    if (!profile.username) {
      console.log(
        "🔀 Profile has no username, redirecting to profile setup...",
      );
      revalidatePath("/profile/setup");
      redirect("/profile/setup");
    } else {
      console.log("🔀 Profile complete, redirecting to explore...");
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
      console.error("💥 Unexpected OTP verification error:", error);
      return {
        error: `An unexpected error occurred: ${error.message}. Please try again.`,
        success: false,
      };
    }

    throw error;
  }
}
