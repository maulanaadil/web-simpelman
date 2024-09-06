import { Outlet, useNavigate } from '@remix-run/react';
import { BackSquare } from 'iconsax-react';
import LogoIcon from '~/assets/icons/logo';

export default function AuthLayout() {
  const navigate = useNavigate();

  return (
    <div className='grid grid-cols-2 h-screen'>
      <div className='overflow-hidden relative w-full h-full px-20 py-[12rem]'>
        <div className='inset-0 w-full h-full absolute z-20 bg-base-900/80'></div>
        <div className='absolute w-full h-full z-10 inset-0'>
          <img
            className='object-cover w-full h-full'
            src='https://images.unsplash.com/photo-1702906680501-f74c836d0120?q=80&w=2920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            alt='graveyard'
          />
        </div>
        <div className='absolute z-30 p-3 rounded-xl bg-base-50 flex items-center gap-3 w-fit'>
          {/* TODO: LOGO HERE */}
          <div></div>
          <div className='flex flex-col gap-2'>
            <p className='text-sm font-semibold text-base-800'>
              Kabupaten Bandung
            </p>
            <p className='text-xs text-base-400'>
              Dinas Pemukiman dan Pertamanan
            </p>
          </div>
        </div>
        <LogoIcon
          width={593}
          height={545}
          className='absolute z-30 -bottom-64 left-1/2 transform -translate-x-1/2'
        />
      </div>
      <div className='w-full h-full bg-base-50'>
        <div className='px-[7.5rem] py-[5rem] flex flex-col gap-10'>
          <button
            className='flex items-center gap-2.5'
            onClick={() => navigate(-1)}
          >
            <BackSquare color='#0f9650' size={20} />
            <p className='text-primary-500 font-medium'>Kembali</p>
          </button>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
