import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
  useRouteError,
} from '@remix-run/react';
import { BackSquare } from 'iconsax-react';
import { useState } from 'react';
import { Dialog } from '~/components/ui/dialog';
import { dashboardPages } from '~/constants/pages';
import { cn } from '~/lib/utils';
import { sessionStorage } from '~/services/session.server';

export type ContextType = [
  id: string | number | undefined,
  setId: React.Dispatch<React.SetStateAction<string | number | undefined>>
];

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie')
  );

  const user = session.get('user');

  if (!user) {
    session.flash('toast', {
      message: 'Anda harus masuk terlebih dahulu',
      type: 'error',
    });
    throw redirect('/signin', {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    });
  }

  if (user.role === 'user') {
    session.flash('toast', {
      message: 'Akses ditolak, Anda tidak memiliki hak akses',
      type: 'error',
    });
    throw redirect('/signin', {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    });
  }

  return null;
}

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

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [id, setId] = useState<ContextType>();

  return (
    <Dialog
      open={!!id}
      onOpenChange={() => setId(undefined)}
      aria-label='Dialog example'
    >
      <div className='h-screen p-6'>
        <button
          className='flex items-center gap-2.5'
          onClick={() =>
            navigate({
              pathname: '/',
            })
          }
        >
          <BackSquare color='#0f9650' size={20} />
          <p className='text-primary-500 font-medium'>
            Kembali ke halaman utama
          </p>
        </button>
        <div className='bg-primary-500 p-4 rounded-lg flex flex-col gap-1.5 my-4'>
          <p className='text-2xl text-base-50 tracking-tight'>Dashboard</p>
          <p className='text-base-50'>
            Kelola semua sistem simpelman dengan mudah
          </p>
        </div>
        <div className='flex flex-col p-4 space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <aside className='-mx-4 lg:w-1/5'>
            <nav className='flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1'>
              {dashboardPages.map((page) => (
                <Link
                  key={page.routes}
                  className={cn(
                    'inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-primary-500 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-9 px-4 py-2 hover:bg-transparent hover:underline justify-start',
                    page.routes === location.pathname
                      ? 'bg-muted'
                      : 'bg-transparent'
                  )}
                  to={{
                    pathname: page.routes,
                  }}
                >
                  {page.label}
                </Link>
              ))}
            </nav>
          </aside>
          <Outlet context={[id, setId]} />
        </div>
      </div>
    </Dialog>
  );
}
