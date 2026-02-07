import { type FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Building2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { AuthLayout } from '@/components/layouts';
import { Button, Input, Alert, AlertDescription, Spinner } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

interface FormErrors {
  name?: string;
  email?: string;
  organizationName?: string;
  password?: string;
  confirmPassword?: string;
}

/**
 * Registration page with name, email, organization, and password form.
 */
export const RegisterPage: FC = () => {
  const { register, isRegistering, registerError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Validates form fields.
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

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

    if (!validateForm()) {
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        organizationName: organizationName.trim() || undefined,
      });
      // Navigation is handled by useAuth hook
    } catch {
      // Error is handled by useAuth hook
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      description="Get started with QualityHub for free"
      footer={
        <>
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        {registerError && (
          <Alert variant="error" icon={<AlertCircle className="h-4 w-4" />}>
            <AlertDescription>{registerError}</AlertDescription>
          </Alert>
        )}

        {/* Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium leading-none">
            Full name
          </label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearError('name');
            }}
            leftIcon={<User className="h-4 w-4" />}
            error={errors.name}
            disabled={isRegistering}
            autoComplete="name"
            autoFocus
          />
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium leading-none">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError('email');
            }}
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email}
            disabled={isRegistering}
            autoComplete="email"
          />
        </div>

        {/* Organization Name Field (Optional) */}
        <div className="space-y-2">
          <label htmlFor="organization" className="text-sm font-medium leading-none">
            Organization name{' '}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Input
            id="organization"
            type="text"
            placeholder="Acme Inc."
            value={organizationName}
            onChange={(e) => {
              setOrganizationName(e.target.value);
              clearError('organizationName');
            }}
            leftIcon={<Building2 className="h-4 w-4" />}
            error={errors.organizationName}
            disabled={isRegistering}
            autoComplete="organization"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium leading-none">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError('password');
              }}
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password}
              disabled={isRegistering}
              autoComplete="new-password"
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
            Confirm password
          </label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clearError('confirmPassword');
              }}
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.confirmPassword}
              disabled={isRegistering}
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

        {/* Terms Notice */}
        <p className="text-xs text-muted-foreground">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isRegistering}>
          {isRegistering ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
};
