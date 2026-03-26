"use client";

/**
 * Reusable skeleton loader components for consistent loading states.
 */

export function PostSkeleton() {
  return (
    <div className="w-full py-4 animate-pulse">
      <div className="flex items-center space-x-3">
        <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/5" />
        </div>
      </div>
      <div className="space-y-2 mt-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
      <div className="mt-4 flex justify-between">
        <div className="flex space-x-4">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-8" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-8" />
        </div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-8" />
      </div>
    </div>
  );
}

export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-10 shrink-0" />
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-2 p-2 animate-pulse">
      <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-8 w-8 shrink-0" />
      <div className="space-y-1 flex-1">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      </div>
    </div>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
    </div>
  );
}
