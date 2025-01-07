// Sign in with OTP / Magic Link

import { createClient } from "@/utils/supabase/client";

export async function signInWithEmail(email: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `https://ostracon.app/welcome`,
    },
  });
}
