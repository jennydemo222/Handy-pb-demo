import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { login, LoginError, LoginResult } from '../lib/pocketbase';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface LoginProps {
  onSuccess?: (result: LoginResult) => void;
}

export function Login({ onSuccess }: LoginProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<LoginError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await login({ email, password });
      
      if (result.success) {
        // Clear form on success
        setEmail('');
        setPassword('');
        onSuccess?.(result);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      // This should rarely happen as login() handles all errors
      setError(
        new LoginError(
          'An unexpected error occurred',
          'UNKNOWN_ERROR',
          err
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error: LoginError): string => {
    switch (error.code) {
      case 'VALIDATION_ERROR_EMAIL_REQUIRED':
        return t('login.errors.emailRequired');
      case 'VALIDATION_ERROR_PASSWORD_REQUIRED':
        return t('login.errors.passwordRequired');
      case 'VALIDATION_ERROR_EMAIL_INVALID':
        return t('login.errors.emailInvalid');
      case 'INVALID_CREDENTIALS':
      case 'UNAUTHORIZED':
        return t('login.errors.invalidCredentials');
      case 'ACCOUNT_DISABLED':
        return t('login.errors.accountDisabled');
      case 'RATE_LIMITED':
        return t('login.errors.rateLimited');
      case 'NETWORK_ERROR':
        return t('login.errors.networkError');
      case 'TIMEOUT_ERROR':
        return t('login.errors.timeoutError');
      case 'SERVER_ERROR':
        return t('login.errors.serverError');
      default:
        return t('login.errors.unknownError');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('login.title')}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div 
              className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{getErrorMessage(error)}</span>
            </div>
          )}

          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('login.email')}
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isLoading}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('login.password')}
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? t('login.loggingIn') : t('login.loginButton')}
          </Button>
        </form>
      </div>
    </div>
  );
}
