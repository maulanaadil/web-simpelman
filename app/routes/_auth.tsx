import { Outlet } from '@remix-run/react';
import LogoIcon from '~/assets/icons/logo';
import DistrictOfficeCard from '~/components/district-office-card';

export default function AuthLayout() {
  return (
    <div className='grid grid-cols-2 h-screen'>
      <div className='overflow-hidden relative w-full h-full px-20 py-[12rem] bg-primary-500'>
        <DistrictOfficeCard className='absolute z-30' />
        <LogoIcon
          width={250}
          height={220}
          isWhite
          className='absolute z-30 bottom-[30%] left-32 transform -translate-x-1/2'
        />
        <LogoIcon
          width={210}
          height={200}
          isWhite
          className='absolute z-30 bottom-0 left-1/2 transform -translate-x-1/2'
        />
        <LogoIcon
          width={510}
          height={470}
          isWhite
          className='absolute z-30 -right-1/3 transform -translate-x-1/3'
        />
      </div>
      <div className='w-full h-full bg-base-50'>
        <Outlet />
      </div>
    </div>
  );
}
