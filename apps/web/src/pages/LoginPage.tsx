import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/layouts';

export const LoginPage: FC = () => {
  return (
    <AuthLayout
      title="Sign in to QualityHub"
      description="Enter your credentials to access your account"
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <p className="text-center text-muted-foreground">
        Login form coming soon
      </p>
    </AuthLayout>
  );
};
