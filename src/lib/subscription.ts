"use server";

import { getMyAllTimeRequestCount } from "@/actions/ai-usage";
import { SubscriptionCheck } from "@/types/subscription";

export async function validateSubscriptionAndUsage(
  userId: string,
): Promise<SubscriptionCheck> {
  try {
    const requestsUsed = await getMyAllTimeRequestCount(userId);

    return {
      requestsUsed,
      requestsRemaining: Infinity, // Unlimited for subscribers
    };
  } catch (error) {
    console.error("Error validating subscription:", error);
    throw error;
  }
}
