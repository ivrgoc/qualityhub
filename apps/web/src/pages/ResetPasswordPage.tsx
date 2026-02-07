import { type FC, useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/components/layouts';
import { Button, Input, Alert, AlertDescription, Spinner } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

/**
 * Reset password page with new password form.
 * Expects a `token` query parameter from the reset email link.
 */
export const ResetPasswordPage: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword, isResetPasswordLoading, resetPasswordError } = useAuth();

  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSuccess, setIsSuccess] = useState(false);

  // Redirect if no token is provided
  useEffect(() => {
    if (!token) {
      navigate(ROUTES.FORGOT_PASSWORD, { replace: true });
    }
  }, [token, navigate]);

  /**
   * Validates form fields.
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 12) {
      newErrors.password = 'Password must be at least 12 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and a number';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Clears a specific field error when the user starts typing.
   */
  const clearError = (field: keyof FormErrors): void => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Handles form submission.
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm() || !token) {
      return;
    }

    try {
      await resetPassword({ token, password });
      setIsSuccess(true);
    } catch {
      // Error is handled by useAuth hook
    }
  };

  // No token - show nothing (will redirect)
  if (!token) {
    return null;
  }

  // Success state
  if (isSuccess) {
    return (
      <AuthLayout
        title="Password reset successful"
        description="Your password has been successfully changed"
      >
        <div className="space-y-6">
          <Alert variant="success" icon={<CheckCircle2 className="h-4 w-4" />}>
            <AlertDescription>
              You can now sign in with your new password.
            </AlertDescription>
          </Alert>

          <Link to={ROUTES.LOGIN}>
            <Button className="w-full">Continue to sign in</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter your new password below"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        {resetPasswordError && (
          <Alert variant="error" icon={<AlertCircle className="h-4 w-4" />}>
            <AlertDescription>{resetPasswordError}</AlertDescription>
          </Alert>
        )}

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium leading-none">
            New password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError('password');
              }}
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password}
              disabled={isResetPasswordLoading}
              autoComplete="new-password"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Must be at least 12 characters with uppercase, lowercase, and a number
          </p>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label htmlFor="confirm-password" className="text-sm font-medium leading-none">
            Confirm new password
          </label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clearError('confirmPassword');
              }}
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.confirmPassword}
              disabled={isResetPasswordLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isResetPasswordLoading}>
          {isResetPasswordLoading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Resetting password...
            </>
          ) : (
            'Reset password'
          )}
        </Button>

        {/* Back to Login Link */}
        <div className="text-center">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
