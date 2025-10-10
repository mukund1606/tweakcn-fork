import { createRouterClient } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import {
  BatchHandlerPlugin,
  RequestHeadersPlugin,
  ResponseHeadersPlugin,
} from "@orpc/server/plugins";

import type { SafeClient } from "@orpc/client";
import type { InferRouterInputs, InferRouterOutputs, RouterClient } from "@orpc/server";

import { chat } from "./routes/chat";
import { getGoogleFonts } from "./routes/googleFonts";
import { getSubscriptionStatus } from "./routes/subscription";

export const appRouter = {
  getSubscriptionStatus,
  getGoogleFonts,
  chat,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<AppRouter>;
export type SafeAppRouterClient = SafeClient<AppRouterClient>;

export type RouterOutputs = InferRouterOutputs<AppRouter>;
export type RouterInputs = InferRouterInputs<AppRouter>;

export const createServerHandler = () => {
  return new RPCHandler(appRouter, {
    plugins: [
      new BatchHandlerPlugin(),
      new ResponseHeadersPlugin(),
      new RequestHeadersPlugin(),
    ],
  });
};

export const createServerRouter = (headers: () => Promise<Headers>) => {
  return createRouterClient(appRouter, {
    context: async () => {
      const reqHeaders = await headers();
      return {
        reqHeaders,
        resHeaders: new Headers(),
      };
    },
  });
};
