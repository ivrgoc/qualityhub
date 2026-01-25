import { type FC } from 'react';

export const DashboardPage: FC = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Welcome to your QualityHub dashboard
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Projects</h2>
            <p className="mt-2 text-3xl font-bold">0</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Test Cases</h2>
            <p className="mt-2 text-3xl font-bold">0</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Test Runs</h2>
            <p className="mt-2 text-3xl font-bold">0</p>
          </div>
        </div>
      </div>
    </div>
  );
};
