import type { MetaFunction } from '@remix-run/node';
import LogoIcon from '~/assets/icons/logo';
import Button from '~/components/button';
import Header from '~/layouts/header';

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

export default function Index() {
  return (
    <div className='w-full h-full'>
      <Header />
      <Hero />
      <Services />
      <Activities />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <div className='relative w-full h-[47.5rem] overflow-hidden'>
      <div className='w-full h-full absolute z-20 bg-base-900/80'></div>
      <div className='absolute w-full h-full z-10 inset-0'>
        <img
          src='https://images.unsplash.com/photo-1702906680501-f74c836d0120?q=80&w=2920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          className='object-cover w-full h-full'
          alt='graveyard'
        />
      </div>
      <div className='ml-20 py-[7.5rem] absolute z-30 flex flex-col justify-between gap-20'>
        <div className='flex flex-col gap-6'>
          <div className='p-3 rounded-xl bg-base-50 flex items-center gap-3 w-fit'>
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
          <p className='text-[3.5rem] text-base-50 font-bold leading-tight'>
            Sistem Pemakaman <br /> dan Pertamanan
          </p>
          <p className='text-lg text-base-50 font-medium'>
            Hadir Untuk Menjawab Kebutuhan Masyarakat yang Ingin Mendapatkan
            Pelayanan <br /> dengan Nyaman
          </p>
        </div>
        <div className='flex items-center gap-4 '>
          <Button
            text='Pilih layanan'
            className='bg-base-50 text-base-900 hover:bg-base-300 disabled:bg-base-50'
          />
          <Button
            text='Bantuan'
            variant='outline'
            className='bg-transparent border border-base-50 text-base-50 hover:border-base-300 hover:text-base-300 disabled:border-base-300 disabled:text-base-300'
          />
        </div>
      </div>
      <LogoIcon
        width={593}
        height={545}
        className='absolute z-30 top-20 -right-40'
      />
    </div>
  );
}

function Services() {
  return (
    <div className='container py-[3.5rem]'>
      <div className='flex flex-col gap-3 justify-center items-center'>
        <p className='text-primary-500 text-center font-semibold text-2xl'>
          Layanan
        </p>
        <div className='flex flex-col gap-4 justify-center items-center'>
          <p className='text-3xl text-center font-semibold text-base-900'>
            {' '}
            Jenis Layanan yang disediakan
          </p>
          <p className='text-lg text-base-400 text-center'>
            {' '}
            Jenis layanan yang ada di Dinas Cipta Karya, Bina Konstruksi dan
            Tata Ruang <br /> Kabupaten Bandung
          </p>
        </div>
      </div>
      <div className='mt-16 flex gap-4 items-center justify-center'>
        <div className='p-5 rounded-xl border border-base-300 bg-base-50 flex items-center gap-10'>
          <svg
            width='158'
            height='146'
            viewBox='0 0 158 146'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M83.1867 89.7602C111.939 97.2907 142.501 83.2058 155.08 55.629L157.435 50.4665L152.044 48.9653C133.308 43.7475 114.068 47.7492 99.3182 58.3738C97.0961 68.975 92.2547 79.1662 84.75 87.9338L83.1867 89.7602ZM93.0689 63.5289C90.6301 71.1544 86.6654 78.4186 81.1549 84.8565L80.6315 85.468L78.253 88.2467C77.9078 88.125 77.563 88.0001 77.2186 87.8718C80.605 78.3051 86.1249 70.0679 93.0689 63.5289Z'
              fill='#BBBBBB'
            />
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M55.3639 56.4347C41.0345 47.2306 23.0303 43.9804 5.4683 48.8442L0 50.3586L2.31496 55.4529C14.5819 82.4476 44.0164 96.5652 72.1959 90.1646L70.2321 87.8637C62.3091 78.5804 57.3721 67.7032 55.3639 56.4347ZM77.9945 88.5476C77.7449 88.6304 77.4951 88.7116 77.2451 88.791L74.4052 85.4635L73.8317 84.7916C67.66 77.5604 63.4389 69.2868 61.1374 60.6303C69.266 67.2838 75.7889 76.0732 79.7499 86.4967L77.9945 88.5476Z'
              fill='#BBBBBB'
            />
            <path
              d='M77.5153 0.598938C100.686 23.3627 102.276 60.1799 81.1539 84.8564L77.5153 89.1074L73.8317 84.7915C52.7858 60.1324 54.4222 23.3523 77.5153 0.598938Z'
              fill='#BBBBBB'
            />
            <path
              d='M77.7651 96.6723C90.598 101.683 91.1587 119.634 78.6635 125.436L77.7651 125.853L76.8087 125.364C64.8616 119.246 65.4371 101.981 77.7651 96.6723Z'
              fill='#BBBBBB'
            />
            <path
              d='M61.8655 97.0303C58.7706 115.378 42.0235 128.216 23.5014 126.439L20.3042 126.132L21.115 123.019C25.8022 105.026 43.5733 93.692 61.8655 97.0303Z'
              fill='#BBBBBB'
            />
            <path
              d='M92.5843 97.0861C110.884 93.7189 128.676 105.065 133.34 123.078L134.146 126.188L130.944 126.49C112.432 128.24 95.7035 115.417 92.5843 97.0861Z'
              fill='#BBBBBB'
            />
          </svg>
          <div className='flex flex-col justify-between gap-10'>
            <div className='flex flex-col gap-1'>
              <p className='text-2xl font-semibold text-neutral-800'>
                Pemakaman Baru
              </p>
              <p className='font-medium text-neutral-400'>
                Layanan Pemakaman Baru dan Tumpang
              </p>
            </div>
            <Button
              text='Pilih layanan'
              onClick={() => alert('Pilih layanan')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Activities() {
  return (
    <div className='container py-[3.5rem]'>
      <div className='flex flex-col gap-3 justify-center items-center'>
        <p className='text-primary-500 text-center font-semibold text-2xl'>
          Kegiatan
        </p>
        <div className='flex flex-col gap-4 justify-center items-center'>
          <p className='text-3xl text-center font-semibold text-base-900'>
            {' '}
            Kegiatan Dinas Kabupaten Bandung
          </p>
          <p className='text-lg text-base-400 text-center'>
            {' '}
            Berita yang ada di Dinas Cipta Karya, Bina Konstruksi dan Tata Ruang
            Kabupaten Bandung
          </p>
        </div>
      </div>
      <div className='mt-16 grid grid-cols-2 gap-6'>
        {Array.from({ length: 2 }).map((_, idx) => (
          <div
            key={idx}
            className='rounded-lg overflow-clip cursor-pointer hover:opacity-80 transition-all'
          >
            <div className='w-full h-[14.5rem]'>
              <img
                className='object-cover w-full h-full'
                src='https://images.unsplash.com/photo-1707051772724-d976e49c785b?q=80&w=2936&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                alt='graveyard-article'
              />
            </div>
            <div className='p-6 bg-base-50 flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <p className='text-neutral-600 text-sm font-normal'>
                  4 september 2024
                </p>
                <div className='w-[1px] h-4 bg-neutral-400'></div>
                <p className='text-primary-500 text-sm font-normal'>
                  Dinas Kabupaten Bandung
                </p>
              </div>
              <p className='text-2xl font-semibold text-base-900'>
                Pemindahan Makam Bergaransi
              </p>
              <p className='text-neutral-600 text-sm line-clamp-3 font-light'>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Doloremque, velit? Velit, dolore? Quo repudiandae, iure aliquam
                earum, itaque suscipit debitis eaque porro nulla optio id, qui
                ut animi tempore vel.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className='py-4 bg-neutral-900'>
      <div className='container flex justify-between'>
        <p className='text-base-200'>© 2024 Dinas Kabupaten Bandung</p>
        <div className='flex items-center gap-2'>
          <a href='/terms' className='text-sm font-light text-base-200'>
            Terms
          </a>
          <a href='/cookies' className='text-sm font-light text-base-200'>
            Cookies
          </a>
        </div>
      </div>
    </div>
  );
}
