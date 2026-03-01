import React, { useState } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Checkbox from '../../components/ui/Checkbox';
import { UserIcon, LockIcon, AlertCircleIcon, ChurchIcon } from '../../components/Icons';
import { API_URL } from '../../config';

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
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to sign in. Please check your credentials.');
      }

      if (data.user && data.token) {
        localStorage.setItem('token', data.token);
        const role = data.user.role === 'super-admin' ? 'super_admin' : 'admin';
        onLoginSuccess(data.user.email, role);
      } else {
        throw new Error('Invalid response from server.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to connect to the login server.');
    } finally {
      setIsLoading(false);
    }
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
              isPassword={true}
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

    </div>
  );
};