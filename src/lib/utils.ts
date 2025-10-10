import type { ClassValue } from "clsx";
// @ts-expect-error: owned by ngard
import { isEqual } from "@ngard/tiny-isequal";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isDeepEqual(a: unknown, b: unknown): boolean {
  return isEqual(a, b);
}
