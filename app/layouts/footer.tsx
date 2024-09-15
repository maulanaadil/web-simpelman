import { Link } from '@remix-run/react';
import DistrictOfficeCard from '~/components/district-office-card';

export default function Footer() {
  return (
    <div className='py-4 bg-base-200'>
      <div className='container flex flex-col'>
        <div className='flex justify-between pt-[4.5rem] pb-[6.25rem]'>
          <DistrictOfficeCard />
          <div className='grid grid-cols-3 gap-20'>
            <div className='flex flex-col gap-[1.125rem]'>
              <p className='text-base-900 text-sm text-medium'>Layanan</p>
              <div className='flex flex-col gap-2'>
                <Link to={'/sevices/garden'} className='text-sm text-base-400'>
                  Pertamanan
                </Link>
                <Link
                  to={'/sevices/graveyard'}
                  className='text-sm text-base-400'
                >
                  Pemakaman
                </Link>
              </div>
            </div>
            <div className='flex flex-col gap-[1.125rem]'>
              <p className='text-base-900 text-sm text-medium'>Informasi</p>
              <div className='flex flex-col gap-2'>
                <Link to={'#'} className='text-sm text-base-400'>
                  Informasi Pertamanan
                </Link>
                <Link to={'#'} className='text-sm text-base-400'>
                  Informasi Pemakaman
                </Link>
              </div>
            </div>
            <div className='flex flex-col gap-[1.125rem]'>
              <p className='text-base-900 text-sm text-medium'>Kontak</p>
              <div className='flex flex-col gap-2'>
                <p className='text-sm text-base-400'>
                  Email: admin@simpelman.com
                </p>
                <p className='text-sm text-base-400'>Whatsapp: 088222886364</p>
              </div>
            </div>
          </div>
        </div>
        <div className='w-full h-[1px] bg-base-700/20'></div>

        <div className='py-5 text-base-700 text-sm'>
          © 2024 Copyright, Diperkimtan
        </div>
      </div>
    </div>
  );
}
