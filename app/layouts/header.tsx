import { User } from '@prisma/client';
import { LoaderFunctionArgs } from '@remix-run/node';
import {
  Form,
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
} from '@remix-run/react';
import { ArrowDown2, UserSquare } from 'iconsax-react';
import Button from '~/components/button';
import Logo from '~/components/logo';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { pages } from '~/constants/pages';
import { getLocalStorage } from '~/utils/common/localStorage';
import { cn } from '~/utils/common/styles';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = getLocalStorage('user') as User;

  return (
    <div className='bg-base-200 w-full'>
      <div className='container py-4 flex justify-between w-full'>
        <Logo />
        <div className='flex justify-center items-center gap-10'>
          {pages
            .filter((page) => {
              if (user && user.role !== 'admin') {
                return page.route !== '/dashboard';
              }
              return true;
            })
            .map((page) => (
              <Link
                key={page.route}
                className={cn(
                  'p-2.5 transition-all font-semibold text-base-900 overflow-clip',
                  location.pathname === page.route
                    ? 'text-primary-500  pointer-events-none'
                    : "text-base-900 cursor-pointer relative w-fit block after:block after:content-[''] after:absolute after:h-[2px] after:bg-primary-500 after:w-full after:scale-x-0 after:hover:scale-x-75 after:transition after:duration-300 after:origin-left "
                )}
                to={page.route}
              >
                {page.label}
              </Link>
            ))}
        </div>
        {user ? (
          <Popover>
            <PopoverTrigger>
              <div className='relative flex items-center justify-between gap-5 cursor-pointer'>
                <UserSquare size='24' color='#09894a' />
                <p className='font-medium text-base-900'>{user.name}</p>
                <ArrowDown2 size='24' color='#232323' />
              </div>
            </PopoverTrigger>
            <PopoverContent className='w-[16rem]'>
              <ProfileDropdown />
            </PopoverContent>
          </Popover>
        ) : (
          <div className='flex items-center gap-4'>
            <Button
              text='Daftar'
              variant='outline'
              onClick={() => navigate('/signup')}
            />
            <Button text='Masuk' onClick={() => navigate('/signin')} />
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileDropdown() {
  return (
    <div className='w-full flex flex-col gap-3'>
      <Link
        className='block p-3 w-full border hover:border-primary-500 transition-all rounded-lg border-base-50'
        to='/history'
      >
        Riwayat
      </Link>
      <Form method='post' action='/logout'>
        <button
          type='submit'
          onClick={() => localStorage.clear()}
          className=' block p-3 text-danger-500 cursor-pointer border border-danger-500 w-full rounded-lg'
        >
          Keluar
        </button>
      </Form>
    </div>
  );
}
