import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

import { AuthDialogWrapper } from "@/components/auth-dialog-wrapper";
import { ThemeProvider } from "@/components/theme-provider";
import { ChatProvider } from "@/hooks/use-chat-context";
import { ORPCReactProvider } from "@/orpc/provider";

import ClientProviders from "./client-providers";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NuqsAdapter>
        <Suspense>
          <ThemeProvider>
            <ORPCReactProvider>
              <ReactQueryStreamedHydration>
                <ClientProviders>
                  <AuthDialogWrapper />
                  <ChatProvider>{children}</ChatProvider>
                </ClientProviders>
              </ReactQueryStreamedHydration>
            </ORPCReactProvider>
          </ThemeProvider>
        </Suspense>
      </NuqsAdapter>
    </>
  );
}
