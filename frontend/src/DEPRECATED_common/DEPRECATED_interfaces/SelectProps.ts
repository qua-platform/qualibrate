import { InputProps } from "./InputProps";

export interface SelectProps extends InputProps {
  options?: (string | undefined)[];
  onSelectionChange?: (a: string) => void;
}
