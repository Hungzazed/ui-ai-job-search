"use client";

import {
  keepPreviousData,
  useQuery,
  type QueryKey,
} from "@tanstack/react-query";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import type { AsyncData } from "@/hooks/use-async-data";

export function useApiQuery<T>(
  key: QueryKey,
  fetcher: () => Promise<T>,
  options: {
    errorMessage: string;
    enabled?: boolean;
    refetchInterval?: number | false | ((data: T | undefined) => number | false);
    keepPrevious?: boolean;
    staleTime?: number;
  },
): AsyncData<T> {
  const enabled = options.enabled ?? true;

  const query = useQuery({
    queryKey: key,
    queryFn: fetcher,
    enabled,
    refetchInterval:
      typeof options.refetchInterval === "function"
        ? (query) =>
            (options.refetchInterval as (data: T | undefined) => number | false)(
              query.state.data,
            )
        : (options.refetchInterval ?? false),
    ...(options.staleTime === undefined ? {} : { staleTime: options.staleTime }),
    ...(options.keepPrevious ? { placeholderData: keepPreviousData } : {}),
  });

  return {
    data: query.isError ? null : (query.data ?? null),
    error: query.isError
      ? apiErrorMessage(query.error, options.errorMessage)
      : null,
    errorStatus: query.isError ? (apiErrorStatus(query.error) ?? null) : null,
    loading: enabled && query.isFetching,
    reload: () => {
      void query.refetch();
    },
  };
}
