import { useInfiniteQuery } from "@tanstack/react-query";

import type { FontCategory } from "@/types/fonts";
import { useORPC } from "@/orpc/context";

export type FilterFontCategory = "all" | FontCategory;

interface UseFontSearchParams {
  query: string;
  category?: FilterFontCategory;
  limit?: number;
  enabled?: boolean;
}

export function useFontSearch({
  query,
  category = "all",
  limit = 20,
  enabled = true,
}: UseFontSearchParams) {
  const orpc = useORPC();
  return useInfiniteQuery(
    orpc.getGoogleFonts.infiniteOptions({
      input: (pageParam) => ({
        query,
        category,
        limit,
        offset: pageParam,
      }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        return lastPage.hasMore ? lastPage.offset + lastPage.limit : undefined;
      },
      staleTime: 1000 * 60 * 60 * 24, // 1 day
      enabled,
    }),
  );
}
