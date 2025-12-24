export interface IconProps {
  height?: number;
  width?: number;
  color?: string;
  className?: string;
  options?: IconSvgOptions;
  subColor?: string;
}

export type IconSvgOptions = {
  rotationDegree?: number | boolean;
  transition?: string;
};
