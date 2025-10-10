"use client";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  return (
    <>
      <TooltipProvider>
        {children}
        <Toaster
          duration={2000}
          richColors
          closeButton
          position={isMobile ? "top-right" : "bottom-right"}
        />
      </TooltipProvider>
    </>
  );
}
