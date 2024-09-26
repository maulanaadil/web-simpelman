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
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from 'react';
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
  DialogFooter,
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
import { GraveyardAssociation } from 'types/model';

type Graveyard = GraveyardAssociation & {
  createdAt: Date;
};

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
        !!data.photos &&
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
        'photos',
        'religion',
        'numberOfGrave',
        'type',
        'intent',
      ],
    }
  );

type Schema = z.infer<typeof schema>;

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie')
  );

  const url = new URL(request.url);
  const graveyardId = url.searchParams.get('graveyardId');
  const search = url.searchParams.get('search');
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const size = parseInt(url.searchParams.get('size') || '10', 10);

  if (!!graveyardId) {
    const graveyard = await prisma.graveyard.findUnique({
      where: {
        id: graveyardId,
      },
      include: {
        photo: true,
      },
    });

    if (!graveyard) {
      session.flash('toast', {
        type: 'error',
        message: 'Data tidak ditemukan',
      });

      return json<LoaderData>(
        {
          data: {
            graveyard: null,
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
        graveyard: {
          ...graveyard,
          photos: graveyard.photo.map((photo) => ({
            ...photo,
            imageUrl: photo.imageUrl,
          })),
        },
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
      photo: true,
    },
    skip: page * size,
    take: size,
  });

  return json<LoaderData>({
    data: {
      graveyards: graveyards.map((graveyard) => ({
        ...graveyard,
        photos: graveyard.photo.map((photo) => ({
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
        url: `/images/graveyard/${file.name}`,
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
        photos: errors.photos?.message,
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
        photo: {
          create: data?.photos?.map((photo) => ({
            imageUrl: photo.url,
          })),
        },
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
    watch,
  } = useRemixForm<Schema>({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
  });

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
        photos: undefined,
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
        photos: fetcher?.data?.data?.graveyard?.photos.map((photo) => ({
          name: photo.imageUrl,
          url: photo.imageUrl,
        })),
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
    fetcher?.data?.data?.graveyard?.photos,
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
          searchInputPlaceholder='Cari pemakaman'
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
        <fetcher.Form
          onSubmit={handleSubmit}
          method='post'
          encType='multipart/form-data'
        >
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
              <div className='flex flex-col gap-4 max-h-[30rem] px-2 overflow-y-auto'>
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
                          Masukan alamat makam
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
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className='flex items-center gap-4 justify-end'>
              <DialogClose asChild>
                <Button text='Batalkan' variant='outline' />
              </DialogClose>
              <Button text={id === 'add' ? 'Simpan' : 'Update'} type='submit' />
            </div>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </>
  );
}
