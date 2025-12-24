import React from "react";
import { IconProps } from "./IconProps";

export const CheckMarkAfterIcon: React.FunctionComponent<IconProps> = ({ width = 24, height = 24 }) => (
  <svg width={width} height={height} viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 12.251C0 5.62356 5.37258 0.250977 12 0.250977C18.6274 0.250977 24 5.62356 24 12.251C24 18.8784 18.6274 24.251 12 24.251C5.37258 24.251 0 18.8784 0 12.251ZM17.6999 9.46519C18.0944 9.07863 18.1008 8.4455 17.7142 8.05105C17.3277 7.6566 16.6945 7.6502 16.3001 8.03676L9.85714 14.3508L7.69993 12.2368C7.30548 11.8502 6.67235 11.8566 6.28579 12.251C5.89923 12.6455 5.90562 13.2786 6.30007 13.6652L9.15721 16.4652C9.54604 16.8462 10.1682 16.8462 10.5571 16.4652L17.6999 9.46519Z"
      fill="#00D59A"
    />
  </svg>
);
