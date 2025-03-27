import React from 'react';

interface IconProps {
  className?: string;
}

export const GoogleLogo: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="#EA4335"
      d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"
    />
    <path
      fill="#34A853"
      d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2970142 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"
    />
    <path
      fill="#4A90E2"
      d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1272727,9.90909091 L12,9.90909091 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"
    />
    <path
      fill="#FBBC05"
      d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"
    />
  </svg>
);

export const GitHubLogo: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 0C5.37 0 0 5.37 0 12C0 17.31 3.435 21.795 8.205 23.385C8.805 23.49 9.03 23.13 9.03 22.815C9.03 22.53 9.015 21.585 9.015 20.58C6 21.135 5.22 19.845 4.98 19.17C4.845 18.825 4.26 17.76 3.75 17.475C3.33 17.25 2.73 16.695 3.735 16.68C4.68 16.665 5.355 17.55 5.58 17.91C6.66 19.725 8.385 19.215 9.075 18.9C9.18 18.12 9.495 17.595 9.84 17.295C7.17 16.995 4.38 15.96 4.38 11.37C4.38 10.065 4.845 8.985 5.61 8.145C5.49 7.845 5.07 6.615 5.73 4.965C5.73 4.965 6.735 4.65 9.03 6.195C9.99 5.925 11.01 5.79 12.03 5.79C13.05 5.79 14.07 5.925 15.03 6.195C17.325 4.635 18.33 4.965 18.33 4.965C18.99 6.615 18.57 7.845 18.45 8.145C19.215 8.985 19.68 10.05 19.68 11.37C19.68 15.975 16.875 16.995 14.205 17.295C14.64 17.67 15.015 18.39 15.015 19.515C15.015 21.12 15 22.41 15 22.815C15 23.13 15.225 23.505 15.825 23.385C18.2072 22.5807 20.2772 21.0497 21.7437 19.0074C23.2101 16.965 23.9993 14.5143 24 12C24 5.37 18.63 0 12 0Z"
    />
  </svg>
);

export const MicrosoftLogo: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    className={className}
    viewBox="0 0 23 23" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="#f1511b" d="M11.5 0h-11v11h11z" />
    <path fill="#80cc28" d="M23 0h-11v11h11z" />
    <path fill="#00adef" d="M11.5 11.5h-11v11h11z" />
    <path fill="#fbbc09" d="M23 11.5h-11v11h11z" />
  </svg>
);

export const TwitterLogo: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    className={className}
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21.5337 5.85338C20.8594 6.15487 20.1395 6.35342 19.394 6.44565C20.1709 5.97657 20.7628 5.24668 21.0421 4.38439C20.3144 4.81461 19.5142 5.12458 18.6735 5.29662C18.0102 4.57374 17.0506 4.11328 15.9872 4.11328C14.0044 4.11328 12.3947 5.72304 12.3947 7.70584C12.3947 7.99514 12.4246 8.27663 12.4978 8.54594C9.50631 8.39048 6.84628 6.95752 5.06428 4.82681C4.74993 5.37566 4.56651 5.97657 4.56651 6.61799C4.56651 7.8349 5.16961 8.91413 6.09276 9.54337C5.51685 9.5311 4.95851 9.37565 4.4825 9.11854V9.16263C4.4825 10.9004 5.72674 12.3643 7.36963 12.705C7.06746 12.7934 6.73864 12.833 6.40233 12.833C6.16575 12.833 5.93145 12.8139 5.70893 12.7641C6.18274 14.2007 7.5258 15.2373 9.11563 15.2739C7.87138 16.2189 6.30304 16.7873 4.6013 16.7873C4.30133 16.7873 4.01354 16.7745 3.72363 16.7361C5.33582 17.7523 7.23954 18.3333 9.29685 18.3333C15.9776 18.3333 19.6048 12.8963 19.6048 8.16032C19.6048 7.99937 19.6013 7.84377 19.5937 7.68817C20.3333 7.15159 20.9838 6.4795 21.5337 5.72304V5.85338Z"
    />
  </svg>
);

export const AppleLogo: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    className={className}
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.0035 4.77216C14.7076 3.91496 15.2517 2.7453 15.1238 1.5C14.1178 1.55304 12.8959 2.18735 12.1677 3.04426C11.5147 3.79089 10.8618 4.98928 11.0137 6.19749C12.1432 6.30328 13.2996 5.6293 14.0035 4.77216ZM16.3032 12.7233C16.3271 15.8246 19.1453 16.9346 19.1707 16.9471C19.1533 17.0026 18.7626 18.3105 17.8716 19.6667C17.1179 20.8498 16.3289 22.0202 15.0564 22.0444C13.8166 22.068 13.3485 21.2863 11.9155 21.2863C10.483 21.2863 9.96577 22.0202 8.799 22.0444C7.57448 22.068 6.65517 20.7558 5.90136 19.5724C4.33852 17.13 3.12964 12.5862 4.73608 9.58291C5.53276 8.0939 7.01918 7.12816 8.62605 7.10448C9.81736 7.08089 10.9264 7.93791 11.6546 7.93791C12.3829 7.93791 13.7198 6.91479 15.143 7.05719C15.7652 7.0819 17.3982 7.29625 18.4521 8.79528C18.3511 8.86348 16.2842 10.0468 16.3032 12.7233Z"
    />
  </svg>
); 