import { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import { useEffect } from 'react';
import { getToast } from 'remix-toast';
import { toast as notify, Toaster } from 'sonner';

import './tailwind.css';
import '@fontsource-variable/lexend-deca/wght.css';
import { getCookie } from './utils/common/cookies';
import Widget from './components/widget';

import sonnerStyles from '~/styles/sonner.css?url';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: sonnerStyles },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { toast, headers } = await getToast(request);
  const user = await getCookie({ request });

  if (!user) {
    return json({ toast, user: null }, { headers });
  }

  if (!toast) {
    return json({ toast: null, user }, { headers });
  }

  return json({ toast, user }, { headers });
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { toast, user } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (toast?.type === 'error') {
      notify.error(toast.message, {
        closeButton: true,
      });
    }
    if (toast?.type === 'success') {
      notify.success(toast.message, {
        closeButton: true,
      });
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [toast]);

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <Toaster richColors position='top-right' />
        {children}
        <Widget />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
