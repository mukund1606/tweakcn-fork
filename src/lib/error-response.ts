import { MyErrorResponseType, UnauthorizedError, ValidationError } from "@/types/errors";

import { logError } from "./shared";

function jsonError(
  code: MyErrorResponseType["code"],
  message: MyErrorResponseType["message"],
  data: MyErrorResponseType["data"],
  status: MyErrorResponseType["status"],
): Response {
  const response: MyErrorResponseType = { code, message, data, status };
  return new Response(JSON.stringify(response), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function handleError(
  error: unknown,
  context: Record<string, unknown> = {},
): Response {
  if (error instanceof ValidationError) {
    return jsonError("VALIDATION_ERROR", error.message, { details: error.details }, 400);
  }

  if (error instanceof UnauthorizedError) {
    return jsonError("UNAUTHORIZED", error.message, undefined, 401);
  }

  logError(error as Error, context);
  return new Response("Internal Server Error", { status: 500 });
}
