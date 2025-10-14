"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconUser,
  IconPhoto,
  IconMessage,
  IconSearch,
  IconSettings,
  IconShield,
  IconShieldCheck,
} from "@tabler/icons-react";

type ModerationItem = {
  id: string;
  image_url?: string;
  post_id?: string;
  reported_user_id?: string;
  uploaded_by?: string;
  reported_by?: string;
  assigned_to?: string;
  reason: string;
  risk_level: "low" | "medium" | "high" | "critical";
  status: "pending" | "approved" | "rejected" | "escalated";
  sightengine_data?: any;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolved_by?: string;
  type: "image" | "post" | "profile";
};

type Profile = {
  id: string;
  username: string;
  avatar_url?: string;
  is_moderator: boolean;
  is_admin: boolean;
};

export default function ModerationDashboard({
  currentUser,
  userProfile,
}: {
  currentUser: User;
  userProfile: Profile;
}) {
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<
    "pending" | "assigned" | "all" | "users"
  >("pending");
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [assigningTo, setAssigningTo] = useState<string | null>(null);

  const isAdmin = userProfile.is_admin;
  const isModerator = userProfile.is_moderator || userProfile.is_admin;

  useEffect(() => {
    if (isModerator) {
      fetchModerationItems();
    }
    if (isAdmin) {
      fetchUsers();
    }
  }, [selectedTab, isModerator, isAdmin]);

  const fetchModerationItems = async () => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      // Fetch from all three moderation tables
      const [imagesRes, postsRes, profilesRes] = await Promise.all([
        supabase
          .from("images_moderation")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("posts_moderation")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles_moderation")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      const allItems: ModerationItem[] = [
        ...(imagesRes.data || []).map((item) => ({
          ...item,
          type: "image" as const,
        })),
        ...(postsRes.data || []).map((item) => ({
          ...item,
          type: "post" as const,
        })),
        ...(profilesRes.data || []).map((item) => ({
          ...item,
          type: "profile" as const,
        })),
      ];

      // Filter based on selected tab
      let filteredItems = allItems;
      if (selectedTab === "pending") {
        filteredItems = allItems.filter((item) => item.status === "pending");
      } else if (selectedTab === "assigned") {
        filteredItems = allItems.filter(
          (item) =>
            item.assigned_to === currentUser.id ||
            (isAdmin && item.assigned_to !== null),
        );
      }

      setModerationItems(filteredItems);
    } catch (error) {
      console.error("Error fetching moderation items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, username, avatar_url, is_moderator, is_admin")
        .ilike("username", `%${userSearch}%`)
        .order("username")
        .limit(50);

      if (!error && data) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleAssignItem = async (
    itemId: string,
    assigneeId: string | null,
  ) => {
    const supabase = createClient();
    const item = moderationItems.find((i) => i.id === itemId);

    if (!item) return;

    try {
      setAssigningTo(itemId);

      const tableName =
        item.type === "image"
          ? "images_moderation"
          : item.type === "post"
            ? "posts_moderation"
            : "profiles_moderation";

      const { error } = await supabase
        .from(tableName)
        .update({ assigned_to: assigneeId })
        .eq("id", itemId);

      if (!error) {
        await fetchModerationItems();
      }
    } catch (error) {
      console.error("Error assigning item:", error);
    } finally {
      setAssigningTo(null);
    }
  };

  const handleModerationAction = async (
    itemId: string,
    action: "approve" | "reject",
    notes?: string,
  ) => {
    const supabase = createClient();
    const item = moderationItems.find((i) => i.id === itemId);

    if (!item) return;

    try {
      const tableName =
        item.type === "image"
          ? "images_moderation"
          : item.type === "post"
            ? "posts_moderation"
            : "profiles_moderation";

      const updateData = {
        status: action === "approve" ? "approved" : "rejected",
        resolved_at: new Date().toISOString(),
        resolved_by: currentUser.id,
        admin_notes: notes,
      };

      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq("id", itemId);

      if (!error) {
        // If approving an image, add it to user_photos
        if (
          action === "approve" &&
          item.type === "image" &&
          item.image_url &&
          item.uploaded_by
        ) {
          await supabase.from("user_photos").insert({
            user_id: item.uploaded_by,
            photo_url: item.image_url,
          });
        }

        await fetchModerationItems();
        setSelectedItem(null);
      }
    } catch (error) {
      console.error("Error handling moderation action:", error);
    }
  };

  const handleUserRoleUpdate = async (
    userId: string,
    role: "moderator" | "admin" | "user",
  ) => {
    const supabase = createClient();

    try {
      const updateData = {
        is_moderator: role === "moderator" || role === "admin",
        is_admin: role === "admin",
      };

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", userId);

      if (!error) {
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      case "medium":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
      case "high":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900/30";
      case "critical":
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <IconPhoto className="w-4 h-4" />;
      case "post":
        return <IconMessage className="w-4 h-4" />;
      case "profile":
        return <IconUser className="w-4 h-4" />;
      default:
        return <IconAlertTriangle className="w-4 h-4" />;
    }
  };

  if (!isModerator) {
    return (
      <div className="p-6 text-center">
        <IconShield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-600">
          You don't have permission to access the moderation dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <IconShieldCheck className="w-8 h-8" />
          Moderation Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage reported content and user permissions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setSelectedTab("pending")}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            selectedTab === "pending"
              ? "bg-primary text-white border-b-2 border-primary"
              : "text-gray-600 hover:text-primary dark:text-gray-400"
          }`}
        >
          Pending (
          {moderationItems.filter((i) => i.status === "pending").length})
        </button>
        <button
          onClick={() => setSelectedTab("assigned")}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            selectedTab === "assigned"
              ? "bg-primary text-white border-b-2 border-primary"
              : "text-gray-600 hover:text-primary dark:text-gray-400"
          }`}
        >
          Assigned to Me
        </button>
        <button
          onClick={() => setSelectedTab("all")}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            selectedTab === "all"
              ? "bg-primary text-white border-b-2 border-primary"
              : "text-gray-600 hover:text-primary dark:text-gray-400"
          }`}
        >
          All Reports
        </button>
        {isAdmin && (
          <button
            onClick={() => setSelectedTab("users")}
            className={`px-4 py-2 rounded-t-lg transition-colors ${
              selectedTab === "users"
                ? "bg-primary text-white border-b-2 border-primary"
                : "text-gray-600 hover:text-primary dark:text-gray-400"
            }`}
          >
            <IconSettings className="w-4 h-4 inline mr-1" />
            User Management
          </button>
        )}
      </div>

      {/* User Management Tab */}
      {selectedTab === "users" && isAdmin && (
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <IconSearch className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:border-gray-600 dark:bg-gray-800"
              />
            </div>
            <button
              onClick={fetchUsers}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Search
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold mr-3">
                            {user.username[0].toUpperCase()}
                          </div>
                          <span className="font-medium">{user.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            user.is_admin
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              : user.is_moderator
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                          }`}
                        >
                          {user.is_admin
                            ? "Admin"
                            : user.is_moderator
                              ? "Moderator"
                              : "User"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {!user.is_admin && (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleUserRoleUpdate(
                                  user.id,
                                  user.is_moderator ? "user" : "moderator",
                                )
                              }
                              className={`px-3 py-1 text-xs rounded ${
                                user.is_moderator
                                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                                  : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                              } transition-colors`}
                            >
                              {user.is_moderator
                                ? "Remove Moderator"
                                : "Make Moderator"}
                            </button>
                            <button
                              onClick={() =>
                                handleUserRoleUpdate(user.id, "admin")
                              }
                              className="px-3 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 transition-colors"
                            >
                              Make Admin
                            </button>
                          </div>
                        )}
                        {user.is_admin && (
                          <span className="text-xs text-gray-500">
                            Cannot modify admin
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Items */}
      {selectedTab !== "users" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : moderationItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No moderation items found.
            </div>
          ) : (
            moderationItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(item.type)}
                    <span className="font-medium capitalize">
                      {item.type} Report
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getRiskLevelColor(
                        item.risk_level,
                      )}`}
                    >
                      {item.risk_level} risk
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        item.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30"
                          : item.status === "approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    <strong>Reason:</strong> {item.reason}
                  </p>
                  {item.image_url && (
                    <div className="mb-2">
                      <img
                        src={item.image_url}
                        alt="Reported content"
                        className="w-32 h-32 object-cover rounded border cursor-pointer"
                        onClick={() => setSelectedItem(item)}
                      />
                    </div>
                  )}
                </div>

                {item.status === "pending" && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleModerationAction(item.id, "approve")}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      <IconCheck className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleModerationAction(item.id, "reject")}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                    >
                      <IconX className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      View Details
                    </button>
                    {isAdmin && (
                      <select
                        value={item.assigned_to || ""}
                        onChange={(e) =>
                          handleAssignItem(item.id, e.target.value || null)
                        }
                        disabled={assigningTo === item.id}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                      >
                        <option value="">Unassigned</option>
                        <option value={currentUser.id}>Assign to me</option>
                        {/* Add other moderators here */}
                      </select>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Moderation Details</h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <IconX className="w-6 h-6" />
                </button>
              </div>

              {selectedItem.image_url && (
                <div className="mb-4">
                  <img
                    src={selectedItem.image_url}
                    alt="Reported content"
                    className="max-w-full h-auto rounded border"
                  />
                </div>
              )}

              <div className="space-y-3 mb-6">
                <p>
                  <strong>Type:</strong> {selectedItem.type}
                </p>
                <p>
                  <strong>Reason:</strong> {selectedItem.reason}
                </p>
                <p>
                  <strong>Risk Level:</strong> {selectedItem.risk_level}
                </p>
                <p>
                  <strong>Status:</strong> {selectedItem.status}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(selectedItem.created_at).toLocaleString()}
                </p>
                {selectedItem.sightengine_data && (
                  <details className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <summary className="cursor-pointer font-medium">
                      Sightengine Data
                    </summary>
                    <pre className="mt-2 text-sm overflow-auto">
                      {JSON.stringify(selectedItem.sightengine_data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>

              {selectedItem.status === "pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      handleModerationAction(selectedItem.id, "approve")
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                  >
                    <IconCheck className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      handleModerationAction(selectedItem.id, "reject")
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                  >
                    <IconX className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
