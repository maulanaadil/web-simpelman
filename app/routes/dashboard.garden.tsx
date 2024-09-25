import { zodResolver } from '@hookform/resolvers/zod';
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
import { GardenAssociation } from 'types/model';
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

type Garden = GardenAssociation & {
  createdAt: Date;
};

type LoaderData = {
  data: {
    garden?: Garden | null;
    gardens?: Garden[];
    pagination?: {
      page: number;
      size: number;
    };
  };
};

const GardenType = {
  pemda: 'Pemda',
  square: 'Taman',
};

const gardenTypeOptions = [
  {
    value: 'pemda',
    label: 'Pemda',
  },
  {
    value: 'square',
    label: 'Taman',
  },
];

const schema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(8).optional(),
    address: z.string().min(8).optional(),
    photos: z
      .custom<UploadValue[] | undefined>(
        (value) => {
          if (value.length) {
            return true;
          }
          return false;
        },
        {
          message: 'Gambar harus diisi',
        }
      )
      .optional(),
    type: z.enum(['pemda', 'square']).optional(),
    intent: z.enum(['delete', 'add', 'edit']).optional(),
  })
  .refine(
    (data) => {
      if (data.intent === 'delete') {
        // When intent is 'delete', all fields should be optional
        return true;
      }

      // When intent is not 'delete', ensure required fields are filled
      return data.name && data.address && data.type && data.photos;
    },
    {
      message: 'All fields must be filled unless intent is delete',
      path: ['name', 'address', 'type', 'imageUrl'],
    }
  );

type Schema = z.infer<typeof schema>;

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie')
  );

  const url = new URL(request.url);
  const gardenId = url.searchParams.get('gardenId') ?? '';
  const search = url.searchParams.get('search');
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const size = parseInt(url.searchParams.get('size') || '10', 10);

  if (!!gardenId) {
    const garden = await prisma.garden.findUnique({
      where: {
        id: gardenId,
      },
      include: {
        photo: true,
      },
    });

    if (!garden) {
      session.flash('toast', {
        type: 'error',
        message: 'Data tidak ditemukan',
      });

      return json<LoaderData>(
        {
          data: {
            garden: null,
          },
        },
        {
          headers: {
            'Set-Cookie': await sessionStorage.commitSession(session),
          },
        }
      );
    }

    return json<LoaderData>({
      data: {
        garden: {
          ...garden,
          photos: garden.photo.map((photo) => ({
            ...photo,
            imageUrl: photo.imageUrl,
          })),
        },
      },
    });
  }

  const gardens = await prisma.garden.findMany({
    where: {
      name: {
        search: search || undefined,
      },
      address: {
        search: search || undefined,
      },
    },
    skip: page * size,
    take: size,
    include: {
      photo: true,
    },
  });

  return json<LoaderData>({
    data: {
      gardens: gardens.map((garden) => ({
        ...garden,
        photos: garden.photo.map((photo) => ({
          ...photo,
          imageUrl: photo.imageUrl,
        })),
      })),
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
        directory: './public/images/garden',
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
        url: `/images/garden/${file.name}`,
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
        name: undefined,
        address: undefined,
        imageUrl: undefined,
        type: undefined,
        errors,
      },
      { status: 400 }
    );
  }

  if (data?.intent === 'delete') {
    await prisma.garden.delete({
      where: {
        id: `${data.id}`,
      },
    });

    session.flash('toast', {
      type: 'success',
      message: 'Berhasil menghapus taman',
    });

    return json(
      { message: 'Berhasil menghapus taman', ok: true },
      {
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      }
    );
  }

  if (data?.intent === 'add') {
    const garden = await prisma.garden.create({
      data: {
        name: data?.name || '',
        address: data?.address || '',
        photo: {
          create: data?.photos?.map((photo) => ({
            imageUrl: photo.url,
          })),
        },
        type: data?.type || 'pemda',
      },
    });

    session.flash('toast', {
      type: 'success',
      message: 'Berhasil menambahkan taman',
    });

    return json(
      { garden, ok: true },
      {
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      }
    );
  }

  if (data?.intent === 'edit') {
    const garden = await prisma.garden.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        address: data.address,
        photo: {
          deleteMany: {
            id: {
              notIn: data?.photos?.map((photo) => photo.name),
            },
          },
          create: data?.photos?.map((photo) => ({
            imageUrl: photo.url,
          })),
        },
        type: data.type,
      },
    });

    session.flash('toast', {
      type: 'success',
      message: 'Berhasil mengubah taman',
    });

    return json(
      { garden, ok: true },
      {
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      }
    );
  }

  return json(
    {
      name: undefined,
      address: undefined,
      imageUrl: undefined,
      type: undefined,
    },
    { status: 400 }
  );
}

export default function DashboardGarden() {
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
    watch,
  } = useRemixForm<Schema>({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
  });

  const columnHelper = createColumnHelper<Garden>();

  const columns: ColumnDef<Garden, any>[] = [
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
    columnHelper.accessor((row) => row.photos[0], {
      id: 'photos',
      enableSorting: false,
      header: 'Gambar',
      cell: ({ row }) =>
        row.original.photos.length > 0 ? (
          row.original.photos.length > 1 ? (
            <div className='flex flex-wrap gap-1 grow'>
              {row.original.photos.slice(0, 4).map((photo) => (
                <img
                  key={photo.id}
                  src={photo.imageUrl}
                  alt={photo.id}
                  className='w-7 h-7 object-cover rounded'
                />
              ))}
            </div>
          ) : (
            <img
              src={row.original.photos[0].imageUrl}
              alt={row.original.photos[0].id}
              className='w-12 h-12 object-cover rounded-lg'
            />
          )
        ) : (
          <p>No photos available</p>
        ),
    }),
    columnHelper.accessor((row) => row.type, {
      id: 'type',
      enableSorting: true,
      header: 'Tipe',
      cell: ({ row }) => (
        <p className='text-base-900'>{GardenType[row.original.type]}</p>
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
              fetcher.load(`/dashboard/garden?gardenId=${row.original.id}`);
            }}
          />
          <fetcher.Form
            method='delete'
            action={`/dashboard/garden`}
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
    const worksheetData = data?.gardens?.map((garden) => ({
      Nama: garden.name,
      Alamat: garden.address,
      Tipe: GardenType[garden.type],
      DibuatPada: dayjs(garden.createdAt).format('DD MMM YYYY'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Taman');

    XLSX.writeFile(workbook, `garden-${dayjs().format('DD-MM-YYYY')}.xlsx`);
  }, [data?.gardens]);

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
        name: '',
        address: '',
        photos: undefined,
        type: 'pemda',
        intent: 'add',
      });
    }

    if (id !== 'add' && fetcher?.data?.data?.garden) {
      reset({
        id: fetcher?.data?.data.garden.id,
        name: fetcher?.data?.data.garden.name,
        address: fetcher?.data?.data.garden.address,
        photos: fetcher?.data?.data?.garden?.photos.map((photo) => ({
          name: photo.imageUrl,
          url: photo.imageUrl,
        })),
        type: fetcher?.data?.data.garden.type,
        intent: 'edit',
      });
    }
  }, [
    data.garden,
    reset,
    fetcher?.data?.data?.garden?.name,
    fetcher?.data?.data?.garden?.address,
    fetcher?.data?.data?.garden?.photos,
    fetcher?.data?.data?.garden?.type,
    id,
  ]);

  return (
    <>
      <div className='h-full w-full flex flex-col gap-4'>
        <Table
          data={data.gardens as unknown as Garden[]}
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
                {id === 'add' ? 'Tambah' : 'Edit'} Taman
              </p>
              <DialogClose>
                <X className='h-4 w-4' />
              </DialogClose>
            </div>
          </DialogTitle>
          <DialogDescription className='py-4'>
            <fetcher.Form
              className='flex flex-col gap-4'
              onSubmit={handleSubmit}
              method='post'
              encType='multipart/form-data'
            >
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
                description='Nama dari taman tersebut'
                placeholder='Masukan nama taman'
                name='name'
              />
              <Controller
                control={control}
                name='address'
                render={({ field }) => (
                  <div className='flex flex-col gap-2'>
                    <p className="'text-base-700 font-medium text-sm mb-2'">
                      Alamat <span className='text-danger-500'>*</span>
                    </p>
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
                name='photos'
                render={({ field }) => (
                  <InputUpload
                    label='Gambar taman'
                    isRequired
                    isMultiple
                    desc='Upload Gambar taman dengan format “.jpg , .png”'
                    onChange={(value) => field.onChange(value)}
                    value={field?.value as UploadValue[]}
                    error={errors.photos?.message}
                  />
                )}
              />
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
                        {gardenTypeOptions.map((type) => (
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
              <div className='flex items-center gap-4 justify-end'>
                <DialogClose asChild>
                  <Button text='Batalkan' variant='outline' />
                </DialogClose>
                <Button
                  text={id === 'add' ? 'Simpan' : 'Update'}
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
