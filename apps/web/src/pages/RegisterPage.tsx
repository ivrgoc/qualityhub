import { type FC } from 'react';
import { Link } from 'react-router-dom';

export const RegisterPage: FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started with QualityHub for free
          </p>
        </div>
        <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm">
          <p className="text-center text-muted-foreground">
            Registration form coming soon
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
