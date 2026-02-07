import { type FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '@/components/layouts';
import { Button, Input, Alert, AlertDescription, Spinner } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

/**
 * Forgot password page with email input and success state.
 */
export const ForgotPasswordPage: FC = () => {
  const { forgotPassword, isForgotPasswordLoading, forgotPasswordError } = useAuth();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [isSuccess, setIsSuccess] = useState(false);

  /**
   * Validates the email field.
   */
  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(undefined);
    return true;
  };

  /**
   * Handles form submission.
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    try {
      await forgotPassword({ email: email.trim() });
      setIsSuccess(true);
    } catch {
      // Error is handled by useAuth hook
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <AuthLayout
        title="Check your email"
        description={`We've sent a password reset link to ${email}`}
      >
        <div className="space-y-6">
          <Alert variant="success" icon={<CheckCircle2 className="h-4 w-4" />}>
            <AlertDescription>
              If an account exists with this email, you'll receive a password reset link shortly.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Didn't receive the email? Check your spam folder or try again.
            </p>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsSuccess(false);
                setEmail('');
              }}
            >
              Try a different email
            </Button>
          </div>

          <div className="text-center">
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      description="Enter your email and we'll send you a reset link"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        {forgotPasswordError && (
          <Alert variant="error" icon={<AlertCircle className="h-4 w-4" />}>
            <AlertDescription>{forgotPasswordError}</AlertDescription>
          </Alert>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium leading-none">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(undefined);
            }}
            leftIcon={<Mail className="h-4 w-4" />}
            error={emailError}
            disabled={isForgotPasswordLoading}
            autoComplete="email"
            autoFocus
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isForgotPasswordLoading}>
          {isForgotPasswordLoading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Sending reset link...
            </>
          ) : (
            'Send reset link'
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
