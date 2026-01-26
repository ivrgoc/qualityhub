import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/layouts';

export const RegisterPage: FC = () => {
  return (
    <AuthLayout
      title="Create your account"
      description="Get started with QualityHub for free"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <p className="text-center text-muted-foreground">
        Registration form coming soon
      </p>
    </AuthLayout>
  );
};
