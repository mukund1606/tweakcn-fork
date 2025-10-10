"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

import { createORPC } from "./client";
import { ORPCContext } from "./context";
import { getQueryClient } from "./query-client";

export function ORPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [orpc] = useState(() => createORPC());

  return (
    <QueryClientProvider client={queryClient}>
      <ORPCContext.Provider value={orpc}>
        {children}
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </ORPCContext.Provider>
    </QueryClientProvider>
  );
}
