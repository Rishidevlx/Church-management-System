import React, { useState } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Checkbox from '../../components/ui/Checkbox';
import { UserIcon, LockIcon, AlertCircleIcon, ChurchIcon } from '../../components/Icons';

interface LoginFormProps {
  onLoginSuccess: (email: string, role: 'super_admin' | 'admin') => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newFieldErrors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!formData.email) {
      newFieldErrors.email = 'Email is required';
      isValid = false;
    }

    if (!formData.password) {
      newFieldErrors.password = 'Password is required';
      isValid = false;
    }

    setFieldErrors(newFieldErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Increased slightly to show loading state

      const email = formData.email.toLowerCase();
      
      if (email === 'super@admin.com') {
         onLoginSuccess(formData.email, 'super_admin');
      } else if (email === 'admin@church.com') {
         onLoginSuccess(formData.email, 'admin');
      } else {
        throw new Error('Invalid credentials. Please use the Quick Login profiles below.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (role: 'super' | 'admin') => {
    if (role === 'super') {
      setFormData({ email: 'super@admin.com', password: 'password123' });
    } else {
      setFormData({ email: 'admin@church.com', password: 'password123' });
    }
    setError(null);
    setFieldErrors({});
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3 animate-fadeIn shadow-sm">
            <AlertCircleIcon className="mt-0.5 shrink-0 text-red-500" size={18} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="space-y-5">
          <Input
            id="email"
            name="email"
            label="Email Address"
            placeholder="admin@yourchurch.org"
            value={formData.email}
            onChange={handleInputChange}
            icon={<UserIcon size={20} />}
            error={fieldErrors.email}
            autoComplete="email"
            type="email"
          />

          <div className="space-y-1.5">
            <Input
              id="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              isPassword
              value={formData.password}
              onChange={handleInputChange}
              icon={<LockIcon size={20} />}
              error={fieldErrors.password}
              autoComplete="current-password"
              type="password"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" fullWidth isLoading={isLoading} loadingText="Signing in...">
            Sign In
          </Button>
        </div>
        
        <div className="flex items-center justify-center">
          <Checkbox 
            id="remember" 
            label="Remember me for 30 days" 
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
        </div>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-400 font-medium tracking-wider">Quick Access</span>
        </div>
      </div>

      {/* Quick Login Cards */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          type="button"
          onClick={() => fillCredentials('super')}
          className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-brand-200 hover:shadow-md transition-all duration-200 group text-center"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-2 group-hover:scale-110 transition-transform">
            <UserIcon size={20} />
          </div>
          <span className="text-xs font-bold text-slate-700 group-hover:text-brand-700">Super Admin</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Full Control</span>
        </button>

        <button 
          type="button"
          onClick={() => fillCredentials('admin')}
          className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-brand-200 hover:shadow-md transition-all duration-200 group text-center"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2 group-hover:scale-110 transition-transform">
            <ChurchIcon size={20} />
          </div>
          <span className="text-xs font-bold text-slate-700 group-hover:text-brand-700">Administrator</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Operations</span>
        </button>
      </div>
    </div>
  );
};