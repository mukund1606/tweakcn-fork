import { validateSubscriptionAndUsage } from "@/lib/subscription";
import { protectedProcedure } from "@/server/orpc/procedures";

export const getSubscriptionStatus = protectedProcedure.handler(async ({ context }) => {
  const { requestsRemaining, requestsUsed } = await validateSubscriptionAndUsage(
    context.session.user.id,
  );

  return {
    requestsRemaining,
    requestsUsed,
  };
});
