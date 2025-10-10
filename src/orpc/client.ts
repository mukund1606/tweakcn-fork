import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { BatchLinkPlugin } from "@orpc/client/plugins";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

import type { AppRouterClient } from "@/server/orpc";
import { getBaseUrl, getHeaders } from "@/utils/helpers";

export function createORPC() {
  const link = new RPCLink({
    url: getBaseUrl() + "/api/orpc",
    headers: getHeaders,
    plugins: [
      new BatchLinkPlugin({
        groups: [
          {
            condition: () => true,
            context: {},
          },
        ],
      }),
    ],
  });

  const client: AppRouterClient = createORPCClient(link);

  return createTanstackQueryUtils(client);
}
