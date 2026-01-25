import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Page not found
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link to="/">
            <Button>Go back home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
