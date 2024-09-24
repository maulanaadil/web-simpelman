import { Graveyard } from '@prisma/client';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { X } from 'lucide-react';
import Banner from '~/components/banner';
import Button from '~/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { MainLayout } from '~/layouts/main';
import { prisma } from '~/services/db.server';

type LoaderData = {
  graveyard: Graveyard[];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const graveyard = await prisma.graveyard.findMany();

  return json({ graveyard });
}

export default function Graveyard() {
  const navigate = useNavigate();

  const { graveyard } = useLoaderData<LoaderData>();

  return (
    <Dialog>
      <MainLayout>
        <Banner
          title='Pemakaman'
          subtitle='Layanan registrasi dan reservasi dari pemakaman baru untuk TPU dalam ruang lingkup daerah Kabupaten Bandung '
          breadcrumbs={[
            { label: 'Layanan', href: '/services' },
            { label: 'Pemakaman', href: '/services/graveyard' },
          ]}
        />

        <div className='container py-[3.5rem] flex flex-col gap-8'>
          <div className='p-5 rounded-xl bg-base-50 border border-base-300 '>
            <div className='flex flex-col gap-12 justify-between'>
              <div className='flex flex-col gap-3'>
                <p className='text-2xl text-base-900 font-semibold'>
                  Pemakaman Baru
                </p>
                <p className='text-sm text-base-400'>
                  Reservasi terkait pemakaman baru, terdapat 3 langkah utama
                  yaitu :pemilihan TPU administrasi almarhum dan administrasi
                  ahli waris
                </p>
              </div>
              <DialogTrigger>
                <Button text='Reservasi sekarang' />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className='p-4 rounded-lg bg-base-200 flex flex-col gap-1'>
                    <div className='flex w-full item-center justify-between'>
                      <p className='text-2xl text-base-900 font-semibold'>
                        Persyaratan
                      </p>
                      <DialogClose>
                        <X className='h-4 w-4' />
                      </DialogClose>
                    </div>
                    <p className='text-base-400 text-sm font-light leading-7'>
                      Siapkan beberapapersyaratan terkait registrasi pemakaman
                      baru
                    </p>
                  </DialogTitle>
                  <DialogDescription className='py-4'>
                    <ol className='list-decimal list-inside text-base-900 flex flex-col gap-5'>
                      <li>Pendaftar Memiliki KTP yang SAH</li>
                      <li>Nomor HP dan Email Untuk Validasi</li>
                      <li>
                        Memilih Lokasi Taman Pemakaman Umum
                        <ol className='list-disc ml-4 list-inside text-base-900 flex flex-col gap-2'>
                          <li>KTP Almarhum</li>
                          <li>KTP Ahli Waris/Pemohon</li>
                          <li>Surat Keterangan Kematian</li>
                        </ol>
                      </li>
                    </ol>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className='flex  gap-4 flex-row items-center justify-end'>
                  <DialogClose asChild>
                    <Button text='Batalkan' variant='outline' />
                  </DialogClose>
                  <Button
                    text='Reservasi sekarang'
                    onClick={() => navigate('/graveyard-form')}
                  />
                </DialogFooter>
              </DialogContent>
            </div>
          </div>
          <div className='mt-16 flex flex-col gap-3 justify-center items-center'>
            <p className='text-primary-500 text-center font-semibold text-2xl'>
              Informasi
            </p>
            <div className='flex flex-col gap-4 justify-center items-center'>
              <p className='text-3xl text-center font-semibold text-base-900'>
                {' '}
                Daerah Wilayah TPU
              </p>
            </div>
          </div>
          <div className='mt-6 grid grid-cols-2 gap-6'>
            {graveyard.map((data) => (
              <div
                key={data.id}
                className='p-5 rounded-xl border shadow-sm border-base-300 flex items-start gap-5'
              >
                <div className='w-[18rem] h-[11.25rem] overflow-clip rounded-xl'>
                  <img
                    src={data.imageUrl}
                    alt='tpu'
                    className='w-full h-full object-cover rounded-xl'
                  />
                </div>
                <div className='flex flex-col gap-3'>
                  <p className='text-2xl font-semibold text-base-800'>
                    {data.name}
                  </p>
                  <a className='text-base-400' href={data.mapsUrl}>
                    {data.mapsUrl}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    </Dialog>
  );
}
