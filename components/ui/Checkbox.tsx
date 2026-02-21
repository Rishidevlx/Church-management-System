import React from 'react';
import { CheckIcon } from '../Icons';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, id, className = '', ...props }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id={id}
          className="peer appearance-none h-4 w-4 border border-slate-300 rounded bg-white checked:bg-brand-600 checked:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
          {...props}
        />
        <CheckIcon 
          size={12} 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-200" 
        />
      </div>
      <label 
        htmlFor={id} 
        className="text-sm text-slate-600 hover:text-slate-800 cursor-pointer select-none transition-colors"
      >
        {label}
      </label>
    </div>
  );
};

export default Checkbox;