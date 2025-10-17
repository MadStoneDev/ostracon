// app/age-restricted/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AgeRestrictedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("date_of_birth")
    .eq("id", user.id)
    .single();

  // Additional age check
  if (profile?.date_of_birth) {
    const birthDate = new Date(profile.date_of_birth);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age >= 21) {
      redirect("/profile/setup");
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Age Restriction</h1>
        <p className="mb-6">
          Ostracon is only available to users 21 years and older.
        </p>
        <p className="text-sm text-gray-600">
          We appreciate your understanding and look forward to welcoming you
          when you reach the appropriate age.
        </p>
      </div>
    </main>
  );
}
