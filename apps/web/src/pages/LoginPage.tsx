import { type FC } from 'react';
import { Link } from 'react-router-dom';

export const LoginPage: FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Sign in to QualityHub
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>
        <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm">
          <p className="text-center text-muted-foreground">
            Login form coming soon
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
