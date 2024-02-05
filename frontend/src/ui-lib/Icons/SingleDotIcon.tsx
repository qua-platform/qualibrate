import React from "react";

interface Props {
  color?: string;
}

export default function SingleDotIcon({ color }: Props): JSX.Element {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <circle cx="5" cy="5" r="5" fill={color || "#C6CDD6"} />
    </svg>
  );
}
