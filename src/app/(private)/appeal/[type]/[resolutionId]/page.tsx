import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import AppealForm from "@/components/appeal-form";

interface AppealPageProps {
  params: Promise<{
    type: string;
    resolutionId: string;
  }>;
}

export default async function AppealPage({ params }: AppealPageProps) {
  const { type, resolutionId } = await params;
  const supabase = await createClient();

  if (type !== "flag" && type !== "report") {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch resolution details based on type
  let resolution: any = null;

  if (type === "flag") {
    const { data } = await supabase
      .from("fragment_flag_resolutions")
      .select("id, resolution, resolved_at, fragments!inner(user_id, title)")
      .eq("id", resolutionId)
      .single();

    if (!data) notFound();

    const fragment = data.fragments as any;
    if (fragment.user_id !== user.id) {
      redirect("/");
    }

    resolution = {
      id: data.id,
      resolution: data.resolution,
      resolvedAt: data.resolved_at,
      context: `Content flag on: "${fragment.title || "Untitled post"}"`,
    };
  } else {
    const { data } = await supabase
      .from("user_report_resolutions")
      .select("id, resolution, resolved_at, reported_user_id")
      .eq("id", resolutionId)
      .single();

    if (!data) notFound();

    if (data.reported_user_id !== user.id) {
      redirect("/");
    }

    resolution = {
      id: data.id,
      resolution: data.resolution,
      resolvedAt: data.resolved_at,
      context: "User report resolution",
    };
  }

  // Check for existing appeal
  const appealTable = type === "flag" ? "flag_appeals" : "report_appeals";
  const { data: existingAppeal } = await supabase
    .from(appealTable)
    .select("id, status")
    .eq("resolution_id", resolutionId)
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Submit Appeal</h1>

      <div className="border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-2">Resolution Details</h2>
        <p className="text-sm text-muted-foreground mb-1">{resolution.context}</p>
        <p className="text-sm">
          <strong>Decision:</strong> {resolution.resolution}
        </p>
        {resolution.resolvedAt && (
          <p className="text-sm text-muted-foreground">
            Resolved: {new Date(resolution.resolvedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {existingAppeal ? (
        <div className="border rounded-lg p-4">
          <p className="font-semibold">Appeal Already Submitted</p>
          <p className="text-sm text-muted-foreground mt-1">
            Status:{" "}
            <span
              className={`font-medium ${
                existingAppeal.status === "approved"
                  ? "text-green-600"
                  : existingAppeal.status === "rejected"
                    ? "text-red-600"
                    : "text-yellow-600"
              }`}
            >
              {existingAppeal.status}
            </span>
          </p>
        </div>
      ) : (
        <AppealForm type={type} resolutionId={resolutionId} />
      )}
    </div>
  );
}
