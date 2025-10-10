import { Bug } from "lucide-react";

import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { cn } from "@/lib/utils";

type DebugButtonProps = {
  debug?: boolean;
} & React.ComponentProps<typeof Button>;

const isDevMode = env.NODE_ENV === "development";

export function DebugButton({
  className,
  debug = isDevMode,
  ...props
}: DebugButtonProps) {
  if (!debug) return null;

  return (
    <TooltipWrapper label="Debug" asChild>
      <Button variant="ghost" size="icon" className={cn("", className)} {...props}>
        <Bug />
      </Button>
    </TooltipWrapper>
  );
}
