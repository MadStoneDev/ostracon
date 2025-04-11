"use client";

import { createClient } from "@/utils/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useUser() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      // Get the authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return null;
      }

      // Get the user profile
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        return null;
      }

      return {
        ...user,
        profile,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Utility hook to get current user ID
export function useUserId() {
  const { data } = useUser();
  return data?.id;
}

// Hook to invalidate user data (use after updates)
export function useInvalidateUser() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["user"] });
  };
}
