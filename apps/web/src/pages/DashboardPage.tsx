import { type FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export const DashboardPage: FC = () => {
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Dashboard
      </h1>
      <p className="mt-2 text-muted-foreground">
        Welcome to your QualityHub dashboard
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Test Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Test Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
