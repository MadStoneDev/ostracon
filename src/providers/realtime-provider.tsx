"use client";

import { createContext, useContext, useEffect, useRef, useState, useMemo, type ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

type PresenceState = Record<string, { user_id: string; online_at: string }[]>;

type RealtimeContextValue = {
  /** Set of currently online user IDs */
  onlineUsers: Set<string>;
};

const RealtimeContext = createContext<RealtimeContextValue>({
  onlineUsers: new Set(),
});

export function usePresence() {
  return useContext(RealtimeContext);
}

export function RealtimeProvider({
  userId,
  children,
}: {
  userId: string | null;
  children: ReactNode;
}) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase.channel("presence:online", {
      config: { presence: { key: userId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as PresenceState;
        const users = new Set<string>();
        for (const key of Object.keys(state)) {
          users.add(key);
        }
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const value = useMemo(() => ({ onlineUsers }), [onlineUsers]);

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}
