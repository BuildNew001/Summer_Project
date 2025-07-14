import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export const getAvatarUrl = (seed, size = 100) => {
  return `https://robohash.org/${encodeURIComponent(seed)}.png?set=set1&size=${size}x${size}`;
};