import { IconSvgOptions } from "./IconProps";

export const getSvgOptions = ({ rotationDegree }: Partial<IconSvgOptions>) => {
  return {
    style: {
      transform: `rotate(${rotationDegree || 0}deg)`,
      transition: "all 0.25s ease-in",
    },
  };
};
