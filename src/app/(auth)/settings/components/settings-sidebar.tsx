"use client";

import { ChartNoAxesCombined, ExternalLink, LucideIcon, Palette } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type NavItem =
  | {
      type: "link";
      href: __next_route_internal_types__.RouteImpl<string>;
      label: string;
      icon?: LucideIcon;
      isExternal?: boolean;
    }
  | {
      type: "separator";
      id: string;
    };

const BASE_NAV_ITEMS: NavItem[] = [
  { type: "link", href: "/settings/themes", label: "Themes", icon: Palette },
  { type: "link", href: "/settings/usage", label: "AI Usage", icon: ChartNoAxesCombined },
] as const;

// const getSubscriptionNavItems = (): NavItem[] => [
//   { type: "separator", id: "subscription-separator" },
//   {
//     type: "link",
//     href: "/settings/portal",
//     label: "Manage Subscription",
//     icon: CreditCard,
//     isExternal: true,
//   },
// ];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0">
      <nav className="space-y-1">
        {BASE_NAV_ITEMS.map((item) => {
          if (item.type === "separator") {
            return <Separator key={item.id} className="my-2" />;
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "hover:bg-muted flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive && "bg-muted",
              )}
            >
              {item.icon && <item.icon className="size-4" />}
              {item.label}
              {item.isExternal && <ExternalLink className="ml-auto size-4" />}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
