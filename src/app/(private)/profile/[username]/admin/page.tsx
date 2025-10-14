// app/profile/[username]/admin/page.tsx
import { redirect } from "next/navigation";
import ModerationDashboard from "@/components/moderation-dashboard";
import { ModerationGuard } from "@/components/moderation-guard";
import {
  fetchCurrentUser,
  fetchProfileByUsername,
} from "@/utils/supabase/fetch-supabase";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const username = (await params).username;
  return {
    title: `Moderation Dashboard - ${username}`,
    description: "Moderation and administration dashboard",
  };
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const username = (await params).username;

  // Get current user and profile
  const currentUser = await fetchCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const profileData = await fetchProfileByUsername(username);

  return (
    <ModerationGuard
      user={currentUser}
      requireAdmin={false} // Allow both moderators and admins
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You don't have permission to access the moderation dashboard.
            </p>
            <a
              href={`/profile/${username}`}
              className="text-primary hover:underline"
            >
              Return to Profile
            </a>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6">
          {/* Header with navigation */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Moderation Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage reports and user permissions
              </p>
            </div>
            <a
              href={`/profile/${username}`}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Back to Profile
            </a>
          </div>

          <ModerationDashboard
            currentUser={currentUser}
            userProfile={profileData}
          />
        </div>
      </div>
    </ModerationGuard>
  );
}
