"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type PostgresChangeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

type UseRealtimeOptions<T extends Record<string, unknown>> = {
  /** The database table to subscribe to */
  table: string;
  /** The schema (default: "public") */
  schema?: string;
  /** Event types to listen for */
  event?: PostgresChangeEvent;
  /** Column filter (e.g., "conversation_id=eq.abc123") */
  filter?: string;
  /** Callback when a change is received */
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: { old: T; new: T }) => void;
  onDelete?: (payload: T) => void;
  /** Whether the subscription is active (default: true) */
  enabled?: boolean;
};

/**
 * Generic hook for subscribing to Supabase Realtime Postgres changes.
 * Handles channel creation and cleanup automatically.
 */
export function useRealtime<T extends Record<string, unknown>>({
  table,
  schema = "public",
  event = "*",
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();

    const channelName = `realtime:${table}:${filter || "all"}:${Date.now()}`;

    const channelConfig: {
      event: PostgresChangeEvent;
      schema: string;
      table: string;
      filter?: string;
    } = {
      event,
      schema,
      table,
    };

    if (filter) {
      channelConfig.filter = filter;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes" as any,
        channelConfig,
        (payload: RealtimePostgresChangesPayload<T>) => {
          switch (payload.eventType) {
            case "INSERT":
              onInsert?.(payload.new as T);
              break;
            case "UPDATE":
              onUpdate?.({ old: payload.old as T, new: payload.new as T });
              break;
            case "DELETE":
              onDelete?.(payload.old as T);
              break;
          }
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, schema, event, filter, enabled]);
  // Note: callback refs are intentionally excluded from deps to avoid
  // re-subscribing on every render. Callers should use refs or stable callbacks.
}
