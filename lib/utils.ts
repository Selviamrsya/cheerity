import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getInitials = (name:string): string=>name
  .split(" ")
  .map((part) => part[0])
  .join("")
  .toUpperCase()
  .slice(0,2)

// Ensure external URLs have a protocol so they don't resolve as relative paths
export function ensureHttpUrl(url: string): string {
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url) ? url : `https://${url}`;
}