import { zodResolver } from '@hookform/resolvers/zod';
import { Garden, Graveyard } from '@prisma/client';
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  NodeOnDiskFile,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
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
import { Controller } from 'react-hook-form';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import Button from '~/components/button';
import InputText from '~/components/input-text';
import InputUpload, { UploadValue } from '~/components/input-upload';
import Table from '~/components/table/table';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import { prisma } from '~/services/db.server';
import { sessionStorage } from '~/services/session.server';
import { ContextType } from './dashboard';
import { graveyardTypeOptions, religionOptions } from '~/constants/graveyard';

type LoaderData = {
  data: {
    graveyard?: Graveyard | null;
    graveyards?: Graveyard[];
    pagination?: {
      page: number;
      size: number;
    };
  };
};

const GraveyardType = {
  biasa: 'Biasa',
  tumpang: 'Tumpang',
  covid: 'Covid',
};

const schema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(8).optional(),
    mapUrl: z.string().url().min(8).optional(),
    address: z.string().min(8).optional(),
    imageUrl: z
      .custom<UploadValue | undefined>(
        (value) => {
          if (value) {
            if (!value.url) {
              return false;
            }
            return true;
          }
          return false;
        },
        {
          message: 'Gambar harus diisi',
        }
      )
      .optional(),
    religion: z.string().optional(),
    numberOfGrave: z.coerce.number().optional(),
    type: z.enum(['biasa', 'tumpang', 'covid']).optional(),
    intent: z.enum(['delete', 'add', 'edit']).optional(),
  })
  .refine(
    (data) => {
      if (data.intent === 'delete') {
        // When intent is 'delete', all fields should be optional
        return true;
      }

      // When intent is not 'delete', ensure required fields are filled
      return (
        !!data.name &&
        !!data.address &&
        !!data.imageUrl &&
        !!data.religion &&
        !!data.numberOfGrave &&
        !!data.type &&
        !!data.intent
      );
    },
    {
      message: 'All fields must be filled unless intent is delete',
      path: [
        'name',
        'address',
        'imageUrl',
        'religion',
        'numberOfGrave',
        'type',
        'intent',
      ],
    }
  );

type Schema = z.infer<typeof schema>;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const graveyardId = url.searchParams.get('graveyardId');
  const search = url.searchParams.get('search');
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const size = parseInt(url.searchParams.get('size') || '10', 10);

  if (graveyardId) {
    const graveyard = await prisma.graveyard.findUnique({
      where: {
        id: graveyardId,
      },
    });
    return json<LoaderData>({
      data: {
        graveyard,
      },
    });
  }

  const graveyards = await prisma.graveyard.findMany({
    where: {
      name: {
        search: search || undefined,
      },
      address: {
        search: search || undefined,
      },
    },
    include: {
      deceased: true,
    },
    skip: page * size,
    take: size,
  });

  return json<LoaderData>({
    data: {
      graveyards,
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

  const formData = await unstable_parseMultipartFormData(
    request,
    unstable_composeUploadHandlers(
      unstable_createFileUploadHandler({
        directory: './public/images/graveyard',
        avoidFileConflicts: false,
        // Use the actual filename as the final filename
        file({ filename }) {
          return filename;
        },
        // Limit the max size to 10MB
        maxPartSize: 10 * 1024 * 1024,
      }),
      unstable_createMemoryUploadHandler()
    )
  );

  const file = formData.get('file');

  if (file) {
    const files = formData.getAll('file') as NodeOnDiskFile[];
    return json({
      files: files.map((file) => ({
        name: file.name,
        url: `/files/${file.name}`,
      })),
    });
  }

  const { errors, data } = await getValidatedFormData<Schema>(
    formData,
    zodResolver(schema)
  );

  if (errors) {
    return json(
      {
        name: errors.name?.message,
        address: errors.address?.message,
        imageUrl: errors.imageUrl?.message,
        religion: errors.religion?.message,
        numberOfGrave: errors.numberOfGrave?.message,
        errors,
      },
      { status: 400 }
    );
  }

  if (data?.intent === 'delete') {
    await prisma.graveyard.delete({
      where: {
        id: `${data.id}`,
      },
    });

    session.flash('toast', {
      type: 'success',
      message: 'Berhasil menghapus makam',
    });

    return json(
      { message: 'Berhasil menghapus makam', ok: true },
      {
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      }
    );
  }

  if (data?.intent === 'add') {
    const graveyard = await prisma.graveyard.create({
      data: {
        name: data.name || '',
        mapsUrl: data.mapUrl || '',
        address: data.address || '',
        imageUrl: data?.imageUrl?.url || '',
        type: data.type || 'biasa',
        additionalInfo: {},
        religion: data.religion || '',
        numberOfGrave: data.numberOfGrave || 0,
      },
    });

    session.flash('toast', {
      type: 'success',
      message: 'Berhasil menambahkan makam',
    });

    return json(
      { graveyard, ok: true },
      {
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      }
    );
  }

  if (data?.intent === 'edit') {
    const graveyard = await prisma.graveyard.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name || '',
        mapsUrl: data.mapUrl || '',
        address: data.address || '',
        imageUrl: data?.imageUrl?.url || '',
        religion: data.religion || '',
        type: data.type || 'biasa',
        numberOfGrave: data.numberOfGrave || 0,
      },
    });

    session.flash('toast', {
      type: 'success',
      message: 'Berhasil mengubah makam',
    });

    return json(
      { graveyard, ok: true },
      {
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      }
    );
  }

  return json(
    {
      message: 'Tidak ada perubahan',
    },
    { status: 400 }
  );
}

export default function DashboardGraveyard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher<typeof loader>();
  const { data } = useLoaderData<LoaderData>();
  const [id, setId] = useOutletContext<ContextType>();

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

  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useRemixForm<Schema>({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
  });

  console.log(fetcher, 'data');

  const columnHelper = createColumnHelper<Graveyard>();

  const columns: ColumnDef<Graveyard, any>[] = [
    columnHelper.accessor((row) => row.id, {
      id: 'id',
      enableSorting: true,
      header: 'No',
      cell: ({ row }) => <p className='font-bold'>{row.index + 1}</p>,
    }),
    columnHelper.accessor((row) => row.name, {
      id: 'name',
      enableSorting: true,
      header: 'Nama',
      cell: ({ row }) => <p className='text-base-900'>{row.original.name}</p>,
    }),
    columnHelper.accessor((row) => row.address, {
      id: 'address',
      enableSorting: true,
      header: 'Alamat',
      cell: ({ row }) => (
        <p className='text-base-900 line-clamp-1'>{row.original.address}</p>
      ),
    }),
    columnHelper.accessor((row) => row.imageUrl, {
      id: 'imageUrl',
      enableSorting: false,
      header: 'Gambar',
      cell: ({ row }) => (
        <img
          src={row.original.imageUrl}
          alt={row.original.name}
          className='w-20 h-20 object-cover rounded-lg'
        />
      ),
    }),
    columnHelper.accessor((row) => row.type, {
      id: 'type',
      enableSorting: true,
      header: 'Tipe',
      cell: ({ row }) => (
        <p className='text-base-900'>{GraveyardType[row.original.type]}</p>
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
              fetcher.load(
                `/dashboard/graveyard?graveyardId=${row.original.id}`
              );
            }}
          />
          <fetcher.Form
            method='delete'
            action={`/dashboard/graveyard`}
            encType='multipart/form-data'
          >
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
    const worksheetData = data?.graveyards?.map((graveyard) => ({
      Nama: graveyard.name,
      Alamat: graveyard.address,
      Gambar: graveyard.imageUrl,
      Tipe: GraveyardType[graveyard.type],
      DibuatPada: dayjs(graveyard.createdAt).format('DD MMM YYYY'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pemakaman');

    XLSX.writeFile(workbook, `graveyard-${dayjs().format('DD-MM-YYYY')}.xlsx`);
  }, [data?.graveyards]);

  useEffect(() => {
    setSearchParams({
      search: defferedSearch,
      page: deferredPage,
      size: defferedSize,
    });
  }, [setSearchParams, defferedSearch, deferredPage, defferedSize]);

  useEffect(() => {
    if (id === 'add') {
      reset({
        id: '',
        name: '',
        address: '',
        imageUrl: undefined,
        mapUrl: '',
        numberOfGrave: 0,
        religion: '',
        type: 'biasa',
        intent: 'add',
      });
    }

    if (id !== 'add' && fetcher?.data?.data?.graveyard) {
      reset({
        id: fetcher?.data?.data?.graveyard?.id,
        name: fetcher?.data?.data?.graveyard?.name,
        address: fetcher?.data?.data?.graveyard?.address,
        imageUrl: {
          name: fetcher?.data?.data?.graveyard?.imageUrl,
          url: fetcher?.data?.data?.graveyard?.imageUrl,
        },
        mapUrl: fetcher?.data?.data?.graveyard?.mapsUrl,
        numberOfGrave: fetcher?.data?.data?.graveyard?.numberOfGrave,
        religion: fetcher?.data?.data?.graveyard?.religion,
        type: fetcher?.data?.data?.graveyard?.type,
        intent: 'edit',
      });
    }
  }, [
    id,
    reset,
    fetcher?.data?.data?.graveyard,
    fetcher?.data?.data?.graveyard?.id,
    fetcher?.data?.data?.graveyard?.name,
    fetcher?.data?.data?.graveyard?.address,
    fetcher?.data?.data?.graveyard?.imageUrl,
    fetcher?.data?.data?.graveyard?.additionalInfo,
    fetcher?.data?.data?.graveyard?.mapsUrl,
    fetcher?.data?.data?.graveyard?.numberOfGrave,
    fetcher?.data?.data?.graveyard?.religion,
    fetcher?.data?.data?.graveyard?.type,
  ]);

  return (
    <>
      <div className='h-full w-full flex flex-col gap-4'>
        <Table
          data={data.graveyards as unknown as Graveyard[]}
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
                text='Tambah'
                className='w-1/6'
                onClick={() => setId('add')}
              />
              <Button
                type='button'
                text='Download'
                className='w-1/6'
                onClick={exportToExcel}
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
                {id === 'add' ? 'Tambah' : 'Edit'} Makam
              </p>
              <DialogClose>
                <X className='h-4 w-4' />
              </DialogClose>
            </div>
          </DialogTitle>
          <DialogDescription className='py-4'>
            <fetcher.Form
              className='flex flex-col'
              onSubmit={handleSubmit}
              method='post'
              encType='multipart/form-data'
            >
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex flex-col gap-4'>
                  <InputText
                    label={
                      <>
                        Nama <span className='text-danger-500'>*</span>
                      </>
                    }
                    isHookForm
                    control={control}
                    controlName='name'
                    error={errors?.name?.message}
                    description='Nama dari makam tersebut'
                    placeholder='Masukan nama taman'
                    name='name'
                  />
                  <InputText
                    label={
                      <>
                        Map Url <span className='text-danger-500'>*</span>
                      </>
                    }
                    isHookForm
                    control={control}
                    controlName='mapUrl'
                    error={errors?.mapUrl?.message}
                    description='Map Url dari makam tersebut'
                    placeholder='Masukan map url'
                    name='mapUrl'
                  />
                  <Controller
                    control={control}
                    name='address'
                    render={({ field }) => (
                      <div className='flex flex-col gap-2'>
                        <div className='flex flex-col'>
                          <p className='text-base-700 font-medium text-sm mb-1'>
                            Alamat <span className='text-danger-500'>*</span>
                          </p>
                          <p className='text-base-400 text-xs'>
                            Masukan alamat taman
                          </p>
                        </div>
                        <Textarea
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          name='address'
                          placeholder='Tulis pesan anda'
                        />
                        {errors?.address?.message && (
                          <p className='text-danger-500 text-sm'>
                            {errors?.address?.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                  <Controller
                    control={control}
                    name='imageUrl'
                    render={({ field }) => (
                      <InputUpload
                        label='Gambar taman'
                        isRequired
                        desc='Upload Gambar taman dengan format “.jpg , .png”'
                        onChange={(value) => field.onChange(value)}
                        value={field?.value as UploadValue}
                        error={errors.imageUrl?.message}
                      />
                    )}
                  />
                </div>
                <div className='flex flex-col gap-4'>
                  <Controller
                    control={control}
                    name='type'
                    render={({ field }) => (
                      <div className='flex flex-col gap-2 mb-2'>
                        <div className='flex flex-col'>
                          <p className='text-base-700 font-medium text-sm'>
                            Tipe <span className='text-danger-500'>*</span>
                          </p>
                          <p className='text-base-400 text-xs'>
                            Masukan tipe taman
                          </p>
                        </div>
                        <Select
                          value={field.value}
                          onValueChange={(value) => field.onChange(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Pilih taman' />
                          </SelectTrigger>
                          <SelectContent>
                            {graveyardTypeOptions.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors?.type?.message && (
                          <p className='text-danger-500 text-sm'>
                            {errors?.type?.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                  <Controller
                    control={control}
                    name='religion'
                    render={({ field }) => (
                      <div className='flex flex-col gap-2 mb-2'>
                        <div className='flex flex-col'>
                          <p className='text-base-700 font-medium text-sm'>
                            Agama <span className='text-danger-500'>*</span>
                          </p>
                          <p className='text-base-400 text-xs'>
                            Masukan agama taman
                          </p>
                        </div>
                        <Select
                          value={field.value}
                          onValueChange={(value) => field.onChange(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Pilih taman' />
                          </SelectTrigger>
                          <SelectContent>
                            {religionOptions.map((religion) => (
                              <SelectItem
                                key={religion.value}
                                value={religion.value}
                              >
                                {religion.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors?.religion?.message && (
                          <p className='text-danger-500 text-sm'>
                            {errors?.religion?.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                  <InputText
                    label={
                      <>
                        Jumlah makam tersedia{' '}
                        <span className='text-danger-500'>*</span>
                      </>
                    }
                    type='number'
                    isHookForm
                    control={control}
                    controlName='numberOfGrave'
                    error={errors?.numberOfGrave?.message}
                    description='Jumlah makam yang tersedia'
                    placeholder='Masukan jumlah makam'
                    name='numberOfGrave'
                  />
                </div>
              </div>
              <div className='flex items-center gap-4 justify-end'>
                <DialogClose asChild>
                  <Button text='Batalkan' variant='outline' />
                </DialogClose>
                <Button
                  text={id !== 'add' ? 'Simpan' : 'Update'}
                  type='submit'
                />
              </div>
            </fetcher.Form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </>
  );
}
