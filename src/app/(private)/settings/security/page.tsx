import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import TwoFactorSetup from "./two-factor-setup";

export const metadata = {
  title: "Security Settings | Ostracon",
};

export default async function SecuritySettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Check current MFA status
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const totpFactor = factors?.totp?.[0];
  const isMfaEnabled = totpFactor?.status === "verified";

  return (
    <div className="flex flex-col gap-6 p-4 pb-[100px]">
      <div>
        <h1 className="text-2xl font-bold">Security</h1>
        <p className="text-muted-foreground">
          Manage your account security settings
        </p>
      </div>

      <TwoFactorSetup
        isMfaEnabled={isMfaEnabled}
        factorId={totpFactor?.id}
      />
    </div>
  );
}
