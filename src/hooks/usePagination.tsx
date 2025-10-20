import { useState, useCallback } from "react";

interface UsePaginationProps<T> {
  initialData: T[];
  fetchMoreData: (page: number) => Promise<T[]>;
  pageSize?: number;
}

export function usePagination<T>({
  initialData,
  fetchMoreData,
  pageSize = 25,
}: UsePaginationProps<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const newData = await fetchMoreData(nextPage);

      setData((prev) => [...prev, ...newData]);
      setPage(nextPage);
      setHasMore(newData.length === pageSize);
    } catch (error) {
      console.error("Error loading more data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore, fetchMoreData, pageSize]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setPage(0);
      const refreshedData = await fetchMoreData(0);

      setData(refreshedData);
      setHasMore(refreshedData.length === pageSize);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchMoreData, pageSize]);

  return {
    data,
    loadMore,
    refresh,
    isLoading,
    hasMore,
  };
}
