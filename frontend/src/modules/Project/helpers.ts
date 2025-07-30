export const createClickHandler = (onClick?: (name: string) => void, name?: string) => {
  return () => {
    if (onClick && name) onClick(name);
  };
};

export const extractInitials = (name?: string): string => {
  if (!name) return "";
  const parts = name.trim().split(" ").slice(0, 2);
  const first = parts[0] ?? "";
  const second = parts[1] ?? "";
  return (first[0] ?? "").toUpperCase() + (second[0] ?? "").toUpperCase();
};
