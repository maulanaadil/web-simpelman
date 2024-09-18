import { useState } from 'react';
import LogoIcon from '~/assets/icons/logo';
import Button from '~/components/button';
import DistrictOfficeCard from '~/components/district-office-card';
import { MainLayout } from '~/layouts/main';

export default function About() {
  return (
    <MainLayout>
      <div className='bg-primary-500'>
        <div className='container py-14 grid grid-cols-2 gap-6'>
          <div className='flex items-center gap-3'>
            <LogoIcon isWhite width={134} height={123} />
            <div className='flex flex-col items-center justify-center gap-2'>
              <p className='text-base-50 text-6xl font-bold uppercase'>
                SIMPELMAN
              </p>
              <p className='text-base-50 text-xs opacity-75'>
                Sistem Informasi Pelayanan Pertamanan dan Pemakaman
              </p>
            </div>
          </div>
          <div className='flex flex-col gap-8'>
            <div className='flex flex-col gap-3'>
              <p className='text-2xl text-base-50 font-semibold'>Tentang</p>
              <p className='text-3xl text-base-50 font-semibold'>Definisi</p>
            </div>
            <p className='text-base-200 text-lg'>
              Simpleman adalah aplikasi resmi dari Dinas Perumahan, Kawasan
              Permukiman, dan Pertanahan (Disperkimtan) Kabupaten Bandung yang
              dirancang untuk mempermudah masyarakat dalam melakukan reservasi
              pemakaman baru serta mengakses informasi terkait pertamanan di
              wilayah Kabupaten Bandung.
            </p>
            <DistrictOfficeCard />
          </div>
        </div>
      </div>
      <div className='container py-14 grid grid-cols-2 gap-6'>
        <div className='flex items-center gap-3'>
          <LogoIcon width={134} height={123} />
          <p className='text-base-900 text-6xl font-bold uppercase'>
            SIMPELMAN
          </p>
        </div>
        <div className='flex flex-col gap-8'>
          <div className='flex flex-col gap-3'>
            <p className='text-2xl text-primary-500 font-semibold'>Filosofi</p>
            <p className='text-3xl text-base-900 font-semibold'>Logo</p>
          </div>
          <p className='text-base-400 text-lg'>
            Bunga melati dengan daun 6 tangkai yang terdiri dari 2 berwarna
            hijau tua, 2 berwarna hijau muda, dan 2 berwarna biru <br /> <br />
            <span className='font-bold'>
              Pelayanan Pertamanan dan Pemakaman
            </span>{' '}
            menggambarkan sinergi antara kehidupan, perawatan, dan warisan yang
            ada di dalam pelayanan tersebut.
          </p>
          <DistrictOfficeCard />
        </div>
      </div>
      <div className='container py-14 grid grid-cols-2 gap-6'>
        <div className='rounded-lg bg-base-200 h-fit p-6 flex flex-col gap-8'>
          <div className='flex flex-col gap-3'>
            <p className='text-primary-500 text-xl font-semibold'>Visi</p>
            <p className='text-base-900 text-3xl font-semibold'>Simpelman</p>
          </div>
          <p className='text-base-400 font-light text-lg'>
            Menjadi platform unggulan yang mendukung layanan pemakaman dan
            pertamanan di Kabupaten Bandung, dengan memberikan kemudahan,
            transparansi, dan aksesibilitas yang optimal bagi masyarakat dalam
            mengelola kebutuhan pemakaman dan menjaga keindahan ruang terbuka
            hijau.
          </p>
        </div>
        <div className='p-6 flex flex-col gap-8'>
          <div className='flex flex-col gap-3'>
            <p className='text-primary-500 text-xl font-semibold'>Misi</p>
            <p className='text-base-900 text-3xl font-semibold'>Simpelman</p>
          </div>
          <ul className='list-decimal ml-4 text-base-400 font-light text-lg flex flex-col gap-2'>
            <li>
              Meningkatkan Kemudahan Akses: Menyediakan layanan pemesanan dan
              informasi pemakaman secara online yang mudah diakses oleh
              masyarakat Kabupaten Bandung.
            </li>
            <li>
              Mendukung Transparansi: Menciptakan sistem yang transparan dalam
              hal reservasi pemakaman dan manajemen ruang terbuka hijau,
              sehingga masyarakat dapat memperoleh informasi dengan cepat dan
              akurat.
            </li>
            <li>
              Mempercepat Proses Pelayanan: Mempercepat proses reservasi
              pemakaman dan penyediaan informasi pertamanan melalui teknologi
              yang efisien dan modern.
            </li>
            <li>
              Mendukung Kelestarian Lingkungan: Mengedukasi dan mendorong
              masyarakat untuk ikut serta dalam menjaga kelestarian taman dan
              ruang terbuka hijau di sekitar Kabupaten Bandung.
            </li>
            <li>
              Membangun Kolaborasi: Bekerja sama dengan berbagai pihak untuk
              meningkatkan kualitas layanan dan pengelolaan pemakaman serta
              pertamanan demi kesejahteraan masyarakat.
            </li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}
