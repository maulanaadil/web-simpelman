import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/node';
import {
  useFetcher,
  useLoaderData,
  useOutletContext,
  useSearchParams,
} from '@remix-run/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { X } from 'lucide-react';
import { useCallback, useDeferredValue, useEffect, useState } from 'react';
import { Feedback } from 'types/model';
import * as XLSX from 'xlsx';
import Button from '~/components/button';
import Table from '~/components/table/table';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { prisma } from '~/services/db.server';
import { sessionStorage } from '~/services/session.server';
import { ContextType } from './dashboard';

const AboutFeedback = {
  infrastructural_facilities: 'Fasilitas Infrastruktur',
  service: 'Pelayanan',
  location: 'Lokasi',
  advice: 'Saran',
};

type LoaderData = {
  data: {
    feedback?: Feedback | null;
    feedbacks?: Feedback[];
    pagination?: {
      page: number;
      size: number;
    };
  };
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const feedbackId = url.searchParams.get('feedbackId');
  const search = url.searchParams.get('search');
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const size = parseInt(url.searchParams.get('size') || '10', 10);

  if (feedbackId) {
    const feedback = await prisma.feedback.findUnique({
      where: {
        id: Number(feedbackId),
      },
      include: {
        garden: true,
      },
    });
    return json<LoaderData>({
      data: {
        feedback,
      },
    });
  }

  const feedbacks = await prisma.feedback.findMany({
    where: {
      email: {
        search: search || undefined,
      },
    },
    include: {
      garden: true,
    },
    skip: page * size,
    take: size,
  });

  return json<LoaderData>({
    data: {
      feedbacks,
      pagination: {
        page,
        size,
      },
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie')
  );
  const formData = await request.formData();
  const feedbackId = formData.get('id');
  const intent = formData.get('intent');

  if (intent === 'delete') {
    await prisma.feedback.delete({
      where: {
        id: Number(feedbackId),
      },
    });

    session.flash('toast', {
      type: 'success',
      message: 'Berhasil menghapus feedback',
    });

    return json(
      { message: 'Berhasil menghapus feedback' },
      {
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      }
    );
  }
}

export default function DashboardFeedback() {
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher<typeof loader>();
  const { data } = useLoaderData<LoaderData>();
  const [_, setId] = useOutletContext<ContextType>();
  const [search, setSearch] = useState(() => {
    return searchParams.get('query') ?? '';
  });
  const [page, setPage] = useState(() => {
    return searchParams.get('page') ?? '0';
  });
  const [size, setSize] = useState(() => {
    return searchParams.get('size') ?? '10';
  });

  const defferedSearch = useDeferredValue(search);
  const defferedSize = useDeferredValue(size);
  const deferredPage = useDeferredValue(page);

  const columnHelper = createColumnHelper<Feedback>();

  const columns: ColumnDef<Feedback, any>[] = [
    columnHelper.accessor((row) => row.id, {
      id: 'id',
      enableSorting: true,
      header: 'No',
      cell: ({ row }) => <p className='font-bold'>{row.index + 1}</p>,
    }),
    columnHelper.accessor((row) => row.email, {
      id: 'email',
      enableSorting: true,
      header: 'Email',
      cell: ({ row }) => <p className='text-base-900'>{row.original.email}</p>,
    }),
    columnHelper.accessor((row) => row.content, {
      id: 'content',
      enableSorting: true,
      header: 'Pesan',
      cell: ({ row }) => (
        <p className='text-base-900 line-clamp-1'>{row.original.content}</p>
      ),
    }),
    columnHelper.accessor((row) => row.about, {
      id: 'about',
      enableSorting: true,
      header: 'Keluhan',
      cell: ({ row }) => (
        <p className='text-base-900'>{AboutFeedback[row.original.about]}</p>
      ),
    }),
    columnHelper.accessor((row) => row.createdAt, {
      id: 'createdAt',
      enableSorting: true,
      header: 'Dibuat Pada',
      cell: ({ row }) => (
        <p className='text-base-900'>
          {dayjs(row.original.createdAt).format('DD MMM YYYY')}
        </p>
      ),
    }),
    columnHelper.display({
      header: 'Action',
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Button
            text='Detail'
            onClick={() => {
              setId(row.original.id);
              fetcher.load(`/dashboard/feedback?feedbackId=${row.original.id}`);
            }}
          />
          <fetcher.Form method='post' action={`/dashboard/feedback`}>
            <input type='hidden' name='id' value={row.original.id} />
            <Button
              variant='outline'
              name='intent'
              value='delete'
              type='submit'
              text='Hapus'
            />
          </fetcher.Form>
        </div>
      ),
    }),
  ];

  const exportToExcel = useCallback(() => {
    const worksheetData = data?.feedbacks?.map((feedback) => ({
      Email: feedback.email,
      Saran: feedback.content,
      Keluhan: AboutFeedback[feedback.about],
      Taman: feedback.garden?.name,
      AlamatTaman: feedback.garden?.address,
      TipeTaman: feedback.garden?.type,
      DibuatPada: dayjs(feedback.createdAt).format('DD MMM YYYY'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Feedback');

    XLSX.writeFile(workbook, `feedback-${dayjs().format('DD-MM-YYYY')}.xlsx`);
  }, [data?.feedbacks]);

  useEffect(() => {
    setSearchParams({
      search: defferedSearch,
      page: deferredPage,
      size: defferedSize,
    });
  }, [setSearchParams, defferedSearch, deferredPage, defferedSize]);

  return (
    <>
      <div className='h-full w-full flex flex-col gap-4'>
        <Table
          data={data.feedbacks as unknown as Feedback[]}
          columns={columns}
          isHasSearch
          search={search || ''}
          onChangeSearch={setSearch}
          searchInputPlaceholder='Cari saran'
          isPaginate
          pagination={{
            page: Number(page),
            size: Number(size),
          }}
          onChangePagination={({ page, size }) => {
            setPage(`${page}`);
            setSize(`${size}`);
          }}
          isHasFilter
          renderFilter={() => (
            <>
              <Button
                type='button'
                className='w-1/5'
                text='Download'
                onClick={() => exportToExcel()}
              />
            </>
          )}
        />
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='p-4 rounded-lg bg-base-200 flex flex-col gap-1'>
            <div className='flex w-full item-center justify-between'>
              <p className='text-2xl text-base-900 font-semibold'>
                Saran Pertamanan
              </p>
              <DialogClose>
                <X className='h-4 w-4' />
              </DialogClose>
            </div>
            <p className='text-base-400 text-sm font-light leading-7'>
              Berikut detail saran yang diberikan oleh pengguna
            </p>
          </DialogTitle>
          <DialogDescription className='py-4'>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-2'>
                <p className='font-semibold text-neutral-900'>Email: </p>
                <p>{fetcher.data?.data.feedback?.email}</p>
              </div>
              <div className='flex items-center gap-2'>
                <p className='font-semibold text-neutral-900'>Saran: </p>
                <p>{fetcher.data?.data.feedback?.content}</p>
              </div>
              <div className='flex items-center gap-2'>
                <p className='font-semibold text-neutral-900'>Tentang: </p>
                <p>
                  {
                    AboutFeedback[
                      fetcher.data?.data.feedback?.about || 'advice'
                    ]
                  }
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <p className='font-semibold text-neutral-900'>Pertamanan: </p>
                <p>{fetcher.data?.data.feedback?.garden?.name}</p>
              </div>
              <div className='flex items-center gap-2'>
                <p className='font-semibold text-neutral-900'>Dibuat pada: </p>
                <p>{fetcher.data?.data.feedback?.createdAt}</p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </>
  );
}
