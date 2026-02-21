import React from 'react';
import { LoaderIcon } from '../Icons';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
}

const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  loadingText = 'Processing...',
  fullWidth = false,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-70 disabled:cursor-not-allowed rounded-xl text-sm px-5 py-3";
  
  const variants = {
    // Gradient Blue for a more premium look
    primary: "bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 focus:ring-brand-500 active:scale-[0.98] border border-transparent",
    outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 focus:ring-slate-200 shadow-sm",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-400",
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <LoaderIcon className="mr-2 animate-spin" size={18} />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;