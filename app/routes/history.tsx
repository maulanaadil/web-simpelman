import { json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import {
  isRouteErrorResponse,
  useLoaderData,
  useNavigate,
  useRouteError,
  useParams,
} from '@remix-run/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { BackSquare } from 'iconsax-react';
import Table from '~/components/table/table';
import { MainLayout } from '~/layouts/main';
import { prisma } from '~/services/db.server';
import { sessionStorage } from '~/services/session.server';

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
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie')
  );

  const user = session.get('user');

  if (user) {
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

  if (!user || session.has('user')) {
    session.flash('toast', {
      type: 'error',
      message: 'Harap login terlebih dahulu',
    });

    throw redirect('/signin', {
      status: 401,
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
      statusText: 'Unauthorized',
    });
  }
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
