import { onError, ORPCError, os, ValidationError } from "@orpc/server";
import z from "zod";

import type { UserSession } from "@/db/schema";
import type {
  RequestHeadersPluginContext,
  ResponseHeadersPluginContext,
} from "@orpc/server/plugins";
import { auth } from "@/lib/auth";

export type ORPCContext = ResponseHeadersPluginContext & RequestHeadersPluginContext;

const base = os
  .$context<ORPCContext>()
  .route({
    tags: ["API"],
  })
  .use(
    onError((error) => {
      if (
        error instanceof ORPCError &&
        error.code === "BAD_REQUEST" &&
        error.cause instanceof ValidationError
      ) {
        const zodError = new z.ZodError(error.cause.issues as Array<z.core.$ZodIssue>);

        throw new ORPCError("INPUT_VALIDATION_FAILED", {
          status: 422,
          message: z.prettifyError(zodError),
          data: z.flattenError(zodError),
          cause: error.cause,
        });
      }

      if (
        error instanceof ORPCError &&
        error.code === "INTERNAL_SERVER_ERROR" &&
        error.cause instanceof ValidationError
      ) {
        throw new ORPCError("OUTPUT_VALIDATION_FAILED", {
          cause: error.cause,
        });
      }
    }),
  );

export const publicProcedure = base
  // .use(timingMiddleware)
  .use(async ({ next, context }) => {
    const session = (await auth.api.getSession({
      headers: context.reqHeaders ?? new Headers(),
      query: {
        disableCookieCache: true,
      },
    })) as UserSession | null;

    const result = await next({
      context: {
        session,
      },
    });

    return result;
  });

export const protectedProcedure = publicProcedure.use(async ({ context, next }) => {
  const session = context.session;
  if (!session) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "You must be logged in to access this resource.",
    });
  }

  const result = await next({
    context: {
      ...context,
      session: session,
    },
  });
  return result;
});
