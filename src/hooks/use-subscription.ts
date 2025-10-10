import { useQuery } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import { useORPC } from "@/orpc/context";

export const SUBSCRIPTION_STATUS_QUERY_KEY = "subscriptionStatus";

export function useSubscription() {
  const orpc = useORPC();
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session?.user.id;

  const { data: subscriptionStatus, ...query } = useQuery(
    orpc.getSubscriptionStatus.queryOptions({
      enabled: isLoggedIn,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    }),
  );

  return { subscriptionStatus, ...query };
}
