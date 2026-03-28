"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { authRateLimiter } from "@/utils/rate-limit";
import { sendMagicLinkEmail } from "@/lib/email";

/**
 * Request a sign-in link via email.
 * Uses Supabase Admin API to generate the link, then sends it via Resend.
 * This completely bypasses Supabase's built-in email system.
 */
export async function requestOTP(formData: { email: string }) {
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

    const adminClient = createAdminClient();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3080";

    // Use admin API to generate a magic link without sending email
    const { data, error } = await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email: formData.email,
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (error) {
      console.error("Error generating magic link:", error);

      // If user doesn't exist, create them first then generate link
      if (
        error.message.includes("User not found") ||
        error.message.includes("user_not_found") ||
        error.message.includes("Unable to find user")
      ) {
        const { error: createError } =
          await adminClient.auth.admin.createUser({
            email: formData.email,
            email_confirm: true,
          });

        if (createError) {
          console.error("Error creating user:", createError);
          return {
            error: "Unable to create account. Please try again.",
            success: false,
          };
        }

        // Generate link for the new user
        const { data: linkData, error: linkError } =
          await adminClient.auth.admin.generateLink({
            type: "magiclink",
            email: formData.email,
            options: {
              redirectTo: `${siteUrl}/auth/callback`,
            },
          });

        if (linkError || !linkData?.properties?.action_link) {
          console.error("Error generating link for new user:", linkError);
          return {
            error: "Unable to send sign-in link. Please try again.",
            success: false,
          };
        }

        const emailResult = await sendMagicLinkEmail(
          formData.email,
          linkData.properties.action_link,
        );

        if (emailResult.error) {
          console.error("Error sending email:", emailResult.error);
          return {
            error: "Unable to send email. Please try again.",
            success: false,
          };
        }

        return {
          error: null,
          success: true,
          message: "Sign-in link sent to your email.",
        };
      }

      return {
        error: "Unable to send sign-in link. Please try again.",
        success: false,
      };
    }

    if (!data?.properties?.action_link) {
      return {
        error: "Unable to generate sign-in link. Please try again.",
        success: false,
      };
    }

    // Send the magic link via Resend
    const emailResult = await sendMagicLinkEmail(
      formData.email,
      data.properties.action_link,
    );

    if (emailResult.error) {
      console.error("Error sending email:", emailResult.error);
      return {
        error: "Unable to send email. Please try again.",
        success: false,
      };
    }

    return {
      error: null,
      success: true,
      message: "Sign-in link sent to your email.",
    };
  } catch (error) {
    console.error("Unexpected error in requestOTP:", error);
    return {
      error: "Unable to send sign-in link. Please try again.",
      success: false,
    };
  }
}

/**
 * OAuth sign-in (Google, GitHub, Apple).
 * Uses Supabase OAuth directly — no email involved.
 */
export async function signInWithOAuth(
  provider: "google" | "github" | "apple",
) {
  try {
    const supabase = await createClient();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3080";

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message, success: false, url: null };
    }

    return { error: null, success: true, url: data.url };
  } catch {
    return {
      error: "Failed to initiate sign in. Please try again.",
      success: false,
      url: null,
    };
  }
}

/**
 * Verify OTP code.
 * Still uses Supabase verifyOtp for token validation.
 */
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

    const { data, error } = await supabase.auth.verifyOtp({
      email: formData.email,
      token: formData.otp,
      type: "email",
    });

    if (error) {
      return {
        error: "Invalid verification code. Please try again.",
        success: false,
      };
    }

    if (!data.user) {
      return {
        error: "Authentication failed. Please try again.",
        success: false,
      };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", data.user.id)
      .single();

    if (!profile?.username) {
      revalidatePath("/profile/setup");
      redirect("/profile/setup");
    } else {
      revalidatePath("/explore");
      redirect("/explore");
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
      success: false,
    };
  }
}
