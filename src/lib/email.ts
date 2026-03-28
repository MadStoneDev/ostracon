import { getResend } from "@/lib/resend";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Ostracon <noreply@ostracon.app>";

/**
 * Send an OTP verification code via Resend.
 */
export async function sendOTPEmail(email: string, otp: string) {
  const resend = getResend();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3080";

  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `${otp} is your Ostracon verification code`,
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 450px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="margin: 0 0 8px;">Your verification code</h2>
        <p style="color: #666; margin: 0 0 24px;">Enter this code to sign in to Ostracon:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px; margin-bottom: 24px;">
          ${otp}
        </div>
        <p style="color: #999; font-size: 13px; margin: 0;">
          This code expires in 10 minutes. If you didn't request this, you can safely ignore it.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px; margin: 0;">
          <a href="${siteUrl}" style="color: #6366f1;">Ostracon</a> — Where every voice finds its space
        </p>
      </div>
    `,
  });
}

/**
 * Send a magic link sign-in email via Resend.
 */
export async function sendMagicLinkEmail(
  email: string,
  magicLink: string,
) {
  const resend = getResend();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3080";

  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Sign in to Ostracon",
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 450px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="margin: 0 0 8px;">Sign in to Ostracon</h2>
        <p style="color: #666; margin: 0 0 24px;">Click the button below to sign in:</p>
        <a href="${magicLink}" style="display: inline-block; padding: 14px 28px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Sign In
        </a>
        <p style="color: #999; font-size: 13px; margin: 24px 0 0;">
          Or copy this link: <a href="${magicLink}" style="color: #6366f1; word-break: break-all;">${magicLink}</a>
        </p>
        <p style="color: #999; font-size: 13px; margin: 8px 0 0;">
          This link expires in 1 hour. If you didn't request this, ignore it.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px; margin: 0;">
          <a href="${siteUrl}" style="color: #6366f1;">Ostracon</a> — Where every voice finds its space
        </p>
      </div>
    `,
  });
}
