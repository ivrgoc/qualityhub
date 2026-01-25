import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export const HomePage: FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          QualityHub
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          AI-powered test management platform for QA teams
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link to="/login">
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
