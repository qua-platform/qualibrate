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
