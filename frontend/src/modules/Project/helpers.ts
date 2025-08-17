import { colorPalette } from "./constants";

export const extractInitials = (name?: string): string => {
  if (!name) return "";
  const parts = name.trim().split(" ").slice(0, 2);
  const first = parts[0] ?? "";
  const second = parts[1] ?? "";
  return (first[0] ?? "").toUpperCase() + (second[0] ?? "").toUpperCase();
};

export const getColorIndex = (name: string): number => {
    if (!name) return 0;

    let hash = 2166136261;
    for (let i = 0; i < name.length; i++) {
      hash ^= name.charCodeAt(i);
      hash *= 16777619;
    }

    const index = Math.abs(hash) % colorPalette.length;
    return Math.max(0, Math.min(index, colorPalette.length - 1));
  };