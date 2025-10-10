import { ORPCError } from "@orpc/client";
import { unstable_cache } from "next/cache";
import z from "zod";

import type { PaginatedFontsResponse } from "@/types/fonts";
import { env } from "@/env";
import { publicProcedure } from "@/server/orpc/procedures";
import { FALLBACK_FONTS } from "@/utils/fonts";
import { fetchGoogleFonts } from "@/utils/fonts/google-fonts";

const cachedFetchGoogleFonts = unstable_cache(
  fetchGoogleFonts,
  ["google-fonts-catalogue"],
  {
    tags: ["google-fonts-catalogue"],
  },
);

export const getGoogleFonts = publicProcedure
  .input(
    z.object({
      query: z.string().default(""),
      category: z.string().optional(),
      limit: z.number().max(100).min(50).default(20),
      offset: z.number().default(0),
    }),
  )
  .handler(async ({ input }) => {
    const { query, category, limit, offset } = input;
    let googleFonts = FALLBACK_FONTS;

    try {
      googleFonts = await cachedFetchGoogleFonts(env.GOOGLE_FONTS_API_KEY);
    } catch (error) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to fetch Google Fonts",
        cause: error,
      });
    }
    let filteredFonts = googleFonts;

    if (query) {
      filteredFonts = filteredFonts.filter((font) =>
        font.family.toLowerCase().includes(query),
      );
    }

    if (category && category !== "all") {
      filteredFonts = filteredFonts.filter((font) => font.category === category);
    }

    const paginatedFonts = filteredFonts.slice(offset, offset + limit);

    const response: PaginatedFontsResponse = {
      fonts: paginatedFonts,
      total: filteredFonts.length,
      offset,
      limit,
      hasMore: offset + limit < filteredFonts.length,
    };

    return response;
  });
