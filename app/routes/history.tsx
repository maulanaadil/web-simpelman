import { Deceased, User } from '@prisma/client';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { BackSquare } from 'iconsax-react';
import Table from '~/components/table/table';
import { MainLayout } from '~/layouts/main';
import { prisma } from '~/services/db.server';
import { getCookie } from '~/utils/common/cookies';

type History = {
  id: string;
  graveyard: {
    id: string;
    name: string;
  };
  name: string;
  status: string;
};

type LoaderData = {
  data: {
    deceased: History[];
  };
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCookie({ request });

  const data = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      deceased: {
        select: {
          id: true,
          name: true,
          graveyard: {
            select: {
              id: true,
              name: true,
            },
          },
          status: true,
        },
      },
    },
  });

  return json({ data, user });
}

const columnHelper = createColumnHelper<History>();

const columns: ColumnDef<History, any>[] = [
  columnHelper.accessor((row) => row.id, {
    id: 'id',
    enableSorting: true,
    header: 'Nomor Registrasi',
    cell: ({ row }) => (
      <p className='text-primary-500 font-bold'>{row.original.id}</p>
    ),
  }),
  columnHelper.accessor((row) => row.graveyard.id, {
    id: 'graveyardId',
    enableSorting: true,
    header: 'Pengajuan TPU',
    cell: ({ row }) => (
      <p className='text-base-900'>{row.original.graveyard.name}</p>
    ),
  }),
  columnHelper.accessor((row) => row.name, {
    id: 'name',
    enableSorting: true,
    header: 'Nama Almarhum',
    cell: ({ row }) => <p className='text-base-900'>{row.original.name}</p>,
  }),
  columnHelper.accessor((row) => row.status, {
    id: 'status',
    enableSorting: true,
    header: 'Status',
    cell: ({ row }) => (
      <p className='text-base-900'>
        {row.original.status === 'belum_terverifikasi'
          ? 'Belum Terverikasi'
          : 'Tervirifikasi'}
      </p>
    ),
  }),
];

export default function History() {
  const navigate = useNavigate();
  const { data } = useLoaderData<LoaderData>();

  return (
    <MainLayout>
      <div className='container py-20'>
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
        <div className='h-screen'>
          <p className='my-8 text-3xl text-base-900 font-bold'>
            Riwayat Pengajuan
          </p>
          <Table data={data.deceased} columns={columns} />
        </div>
      </div>
    </MainLayout>
  );
}
