import { colorPalette } from "./constants";

export const createClickHandler = (onClick?: (name: string) => void, name = "") => () => {
  if (onClick) {
    onClick(name);
  }
};

export const extractInitials = (name?: string): string => {
  if (!name) return "";
  const [first = "", second = ""] = name.trim().split(" ");
  return (first[0] ?? "").toUpperCase() + (second[0] ?? "").toUpperCase();
};

// Gets folder color via hash function algorithm (with FNV-1a hash for uniform distribution to avoid clustering)
export const getColorIndex = (name: string): number => {
    let hash = 2166136261; // FNV offset basis
    for (let i = 0; i < name.length; i++) {
      hash ^= name.charCodeAt(i);
      hash *= 16777619; // FNV prime
    }
    return Math.abs(hash) % colorPalette.length;
  };