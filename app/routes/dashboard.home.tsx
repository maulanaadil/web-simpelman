import { json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useRouteError } from '@remix-run/react';
import { sessionStorage } from '~/services/session.server';

type LoaderData = {};

export function ErrorBoundary() {
  const error = useRouteError() as {
    statusText: string;
    status: number;
  };

  return (
    <div className='h-screen flex justify-center items-center'>
      {error?.status} - {error?.statusText}
    </div>
  );
}

export default function DashboardHome() {
  return (
    <div className='h-full w-full flex justify-center items-center'>
      <h1>Still development</h1>
    </div>
  );
}
