import "server-only";

import { createSafeClient } from "@orpc/client";

import { createServerHandler, createServerRouter } from "@/server/orpc";
import { getHeaders } from "@/utils/helpers";

export const handler = createServerHandler();

/**
 * Export a server-side caller for the oRPC API.
 * @example
 * const res = await api.post.all();
 *       ^? Post[]
 */
export const api = createSafeClient(createServerRouter(getHeaders));
