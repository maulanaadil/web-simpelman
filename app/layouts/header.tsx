import { Link, useLocation, useNavigate } from '@remix-run/react';
import Button from '~/components/button';
import Logo from '~/components/logo';
import { cn } from '~/utils/common/styles';

const pages = [
  {
    route: '/',
    label: 'Home',
  },
  {
    route: '/service',
    label: 'Layanan',
  },
  {
    route: '/activity',
    label: 'Kegiatan',
  },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className='container py-4 flex justify-between w-full bg-base-50'>
      <Logo />
      <div className='flex justify-center items-center gap-10'>
        {pages.map((page) => (
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
      <div className='flex items-center gap-4'>
        <Button
          text='Daftar'
          variant='outline'
          onClick={() => navigate('/auth/signup')}
        />
        <Button text='Masuk' onClick={() => navigate('/auth/signin')} />
      </div>
    </div>
  );
}
