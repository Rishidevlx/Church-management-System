import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from '../Icons';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  isPassword?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  icon,
  error,
  isPassword = false,
  className = '',
  id,
  type, // Destructure type out to prevent it from overriding our dynamic inputType
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any form submission or focus loss
    setShowPassword(!showPassword);
  };

  // Logic: If it's a password field, toggle between 'text' and 'password'.
  // If not, use the passed type or default to 'text'.
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type || 'text';

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <label
        htmlFor={id}
        className={`text-sm font-semibold tracking-wide transition-colors duration-200 ${
          error ? 'text-red-500' : 'text-slate-700'
        }`}
      >
        {label}
      </label>
      <div className="relative group">
        {/* Left Icon */}
        {icon && (
          <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none ${
            error ? 'text-red-400' : isFocused ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-500'
          }`}>
            {icon}
          </div>
        )}

        <input
          id={id}
          type={inputType}
          className={`
            w-full bg-slate-50 border rounded-xl py-3
            ${icon ? 'pl-11' : 'pl-4'} 
            ${isPassword ? 'pr-12' : 'pr-4'}
            outline-none transition-all duration-200
            placeholder:text-slate-400 text-slate-900 font-medium
            h-12
            ${error 
              ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
              : 'border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10'
            }
          `}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />

        {/* Right Icon (Password Toggle) */}
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-600 focus:outline-none focus:text-brand-600 transition-colors p-1 rounded-md cursor-pointer z-10"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1} // Prevent tabbing to the eye icon for smoother flow
          >
            {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1.5 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;