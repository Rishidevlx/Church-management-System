import React, { useEffect } from 'react';
import { CheckIcon, XIcon, AlertCircleIcon } from '../Icons';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'error';
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, type = 'success' }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-fadeIn transition-all transform translate-y-0 ${
      type === 'success' 
        ? 'bg-white border-green-100 text-green-800' 
        : 'bg-white border-red-100 text-red-800'
    }`}>
      <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
        type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
      }`}>
        {type === 'success' ? <CheckIcon size={14} /> : <AlertCircleIcon size={14} />}
      </div>
      
      <p className="text-sm font-semibold pr-2">{message}</p>
      
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600 ml-2">
        <XIcon size={16} />
      </button>
    </div>
  );
};