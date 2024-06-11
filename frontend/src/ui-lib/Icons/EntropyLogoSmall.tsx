import React from "react";
import { IconProps } from "../../common/interfaces/IconProps";

const EntropyLogoSmallIcon: React.FunctionComponent<IconProps> = ({ width = 26, height = 23 }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 26 23" fill="none">
      <g clipPath="url(#clip0_350_4146)">
        <path
          d="M23.7627 4.72106C24.8511 4.72106 25.7581 3.81316 25.7581 2.72369C25.7581 1.63421 24.8511 0.726318 23.7627 0.726318C22.6744 0.726318 21.7674 1.63421 21.7674 2.72369C21.7069 3.81316 22.6139 4.72106 23.7627 4.72106Z"
          fill="#2CCBE5"
        />
        <path
          d="M0.906977 5.44737H16.3256C17.8372 5.44737 19.0465 4.23684 19.0465 2.72368C19.0465 1.21053 17.8372 0 16.3256 0H1.14884C0.544186 0 0 0.544737 0 1.15V4.47895C0 5.02368 0.423256 5.44737 0.906977 5.44737Z"
          fill="#00D59A"
        />
        <path
          d="M0 22.6973V18.2789C0 17.5526 0.544186 17.0079 1.26977 17.0079H19.0465C19.7116 17.0079 19.893 17.7947 19.2279 17.9763L0.786046 23.1816C0.362791 23.2421 0 23 0 22.6973Z"
          fill="#FF2463"
        />
        <path
          d="M2.23721 13.8605H10.2791C11.4884 13.8605 12.5163 12.8316 12.5163 11.621V10.6526C12.5163 9.44209 11.4884 8.41315 10.2791 8.41315H2.23721C1.02791 8.41315 0 9.44209 0 10.6526V11.621C0 12.8316 1.02791 13.8605 2.23721 13.8605Z"
          fill="#FFDB2C"
        />
      </g>
      <defs>
        <clipPath id="clip0_350_4146">
          <rect width="26" height="23" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default EntropyLogoSmallIcon;
