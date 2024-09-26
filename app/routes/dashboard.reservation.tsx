import {
  AdditionalFile,
  AddressDetail,
  Deceased,
  Graveyard,
  Heirs,
} from '@prisma/client';
import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/node';
import {
  useFetcher,
  useLoaderData,
  useOutletContext,
  useSearchParams,
} from '@remix-run/react';
import { prisma } from '~/services/db.server';
import { ContextType } from './dashboard';
import { useCallback, useDeferredValue, useEffect, useState } from 'react';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import Button from '~/components/button';
import Table from '~/components/table/table';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { X } from 'lucide-react';
import {
  genderOptions,
  graveyardTypeOptions,
  religionOptions,
} from '~/constants/graveyard';
import { cn } from '~/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Controller } from 'react-hook-form';
import * as XLSX from 'xlsx';
import { sessionStorage } from '~/services/session.server';
import { sendEmail } from '~/utils/mailer';

type DeceasedAssociation = Deceased & {
  addressDetail: AddressDetail;
  additionalFile: AdditionalFile;
  graveyard: Graveyard;
  heirs: Heirs & {
    addressDetail: AddressDetail;
    additionalFile: AdditionalFile;
  };
};

type LoaderData = {
  data: {
    deceaseds: DeceasedAssociation[];
    deceased: DeceasedAssociation;
    pagination: {
      page: number;
      size: number;
    };
  };
};

const tabs = [
  {
    value: 'detail-tpu',
    label: 'Detail TPU',
  },
  {
    value: 'data-almarhum',
    label: 'Data Almarhum',
  },
  {
    value: 'data-ahli-waris',
    label: 'Data Ahli Waris',
  },
];

const statusOptions = [
  {
    value: 'terverifikasi',
    label: 'Terverifikasi',
  },
  {
    value: 'belum_terverifikasi',
    label: 'Belum Terverifikasi',
  },
];

const schema = z
  .object({
    id: z.string().optional(),
    status: z.enum(['terverifikasi', 'belum_terverifikasi']).optional(),
    intent: z.enum(['delete', 'edit']).optional(),
  })
  .refine(
    (data) => {
      if (data.intent === 'delete') {
        // When intent is 'delete', all fields should be optional
        return true;
      }

      // When intent is not 'delete', ensure required fields are filled
      return !!data.status;
    },
    {
      message: 'All fields must be filled unless intent is delete',
      path: ['status'],
    }
  );

type Schema = z.infer<typeof schema>;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const deceasedId = url.searchParams.get('deceasedId') || '';
  const search = url.searchParams.get('search');
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const size = parseInt(url.searchParams.get('size') || '10', 10);

  if (!!deceasedId) {
    const deceased = await prisma.deceased.findUnique({
      where: {
        id: deceasedId,
      },
      include: {
        additionalFile: true,
        addressDetail: true,
        graveyard: true,
        heirs: {
          include: {
            additionalFile: true,
            addressDetail: true,
          },
        },
      },
    });

    return json({
      data: {
        deceased,
        deceaseds: null,
        pagination: null,
      },
    });
  }

  const deceaseds = await prisma.deceased.findMany({
    where: {
      name: {
        contains: search || undefined,
      },
      fatherInLawName: {
        contains: search || undefined,
      },
      idCard: {
        contains: search || undefined,
      },
    },
    include: {
      additionalFile: true,
      addressDetail: true,
      graveyard: true,
      heirs: {
        include: {
          additionalFile: true,
          addressDetail: true,
        },
      },
    },
    skip: page * size,
    take: size,
  });

  return json({
    data: {
      deceased: null,
      deceaseds,
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

  const { errors, data } = await getValidatedFormData<Schema>(
    request,
    zodResolver(schema)
  );

  if (errors) {
    return json(
      {
        message: 'Terjadi kesalahan',
        errors,
      },
      { status: 400 }
    );
  }

  if (data?.intent === 'delete') {
    await prisma.deceased.delete({
      where: {
        id: `${data.id}`,
      },
      include: {
        additionalFile: true,
        addressDetail: true,
        heirs: {
          include: {
            additionalFile: true,
            addressDetail: true,
          },
        },
      },
    });

    session.flash('toast', {
      type: 'success',
      message: 'Berhasil menghapus reservasi',
    });

    return json(
      { message: 'Berhasil menghapus reservasi', ok: true },
      {
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      }
    );
  }

  const deceased = await prisma.deceased.update({
    where: {
      id: `${data.id}`,
    },
    data: {
      status: data.status,
    },
    include: {
      additionalFile: true,
      addressDetail: true,
      heirs: {
        include: {
          additionalFile: true,
          addressDetail: true,
        },
      },
      user: true,
    },
  });

  await sendEmail({
    name: deceased.heirs?.name,
    to: deceased.user?.email,
    deceasedName: deceased.name,
    type: 'verified-reservation',
  });

  session.flash('toast', {
    type: 'success',
    message: 'Berhasil mengubah status reservasi',
  });

  return json(
    { deceased, ok: true },
    {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    }
  );
}

export default function DashboardReservation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher<typeof loader>();
  const { data } = useLoaderData<LoaderData>();
  const [id, setId] = useOutletContext<ContextType>();
  const [activeTab, setActiveTab] = useState<string>('detail-tpu');

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

  const { handleSubmit, control, reset } = useRemixForm<Schema>({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
  });

  const columnHelper = createColumnHelper<DeceasedAssociation>();

  const columns: ColumnDef<DeceasedAssociation, any>[] = [
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
    columnHelper.accessor((row) => row.idCard, {
      id: 'idCard',
      enableSorting: true,
      header: 'KTP',
      cell: ({ row }) => (
        <p className='text-base-900 line-clamp-1'>{row.original.idCard}</p>
      ),
    }),
    columnHelper.accessor((row) => row.dateOfDeath, {
      id: 'dateOfDeath',
      enableSorting: false,
      header: 'Tanggal Meninggal',
      cell: ({ row }) => (
        <p className='text-base-900 line-clamp-1'>
          {dayjs(row.original.dateOfDeath).format('DD MMM YYYY')}
        </p>
      ),
    }),
    columnHelper.accessor((row) => row.burialDate, {
      id: 'burialDate',
      enableSorting: false,
      header: 'Tanggal Pemakaman',
      cell: ({ row }) => (
        <p className='text-base-900 line-clamp-1'>
          {dayjs(row.original.burialDate).format('DD MMM YYYY')}
        </p>
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
                `/dashboard/reservation?deceasedId=${row.original.id}`
              );
            }}
          />
          <fetcher.Form method='delete' action={`/dashboard/reservation`}>
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
    const worksheetData = data?.deceaseds?.map((deceased) => ({
      No: deceased.id,
      Nama: deceased.name,
      KTP: deceased.idCard,
      'Tanggal Lahir': dayjs(deceased.dateOfBirth).format('DD MMM YYYY'),
      'Jenis Kelamin': genderOptions.find(
        (type) => type.value === deceased.Gender
      )?.label,
      'Tempat Lahir': deceased.placeOfBirth,
      'Nama Bapak': deceased.fatherInLawName,
      'Tanggal Meninggal': dayjs(deceased.dateOfDeath).format('DD MMM YYYY'),
      'Tanggal Pemakaman': dayjs(deceased.burialDate).format('DD MMM YYYY'),
      'Nomor Rumah': deceased.addressDetail.homeNumber,
      Alamat: deceased.addressDetail.street,
      RT: deceased.addressDetail.rt,
      RW: deceased.addressDetail.rw,
      Provinsi: deceased.addressDetail.province,
      Kota: deceased.addressDetail.city,
      Kecamatan: deceased.addressDetail.district,
      Kelurahan: deceased.addressDetail.neighborhood,
      'Dibuat Pada': dayjs(deceased.createdAt).format('DD MMM YYYY'),
      'Nama TPU': deceased.graveyard.name,
      'Jenis Pemakaman': graveyardTypeOptions.find(
        (type) => type.value === deceased.graveyard.type
      )?.label,
      Agama: religionOptions.find(
        (type) => type.value === deceased.graveyard.religion
      )?.label,
      'Alamat TPU': deceased.graveyard.address,
      'Nama Ahli Waris': deceased.heirs.name,
      'Nomor Telepon Ahli Waris': deceased.heirs.phoneNumber,
      'Nomor KTP Ahli Waris': deceased.heirs.idCard,
      Pekerjaan: deceased.heirs.job,
      'Nomor Rumah Ahli Waris': deceased.heirs.addressDetail.homeNumber,
      'Alamat Ahli Waris': deceased.heirs.addressDetail.street,
      'RT Ahli Waris': deceased.heirs.addressDetail.rt,
      'RW Ahli Waris': deceased.heirs.addressDetail.rw,
      ProvinsiAhliWaris: deceased.heirs.addressDetail.province,
      KotaAhliWaris: deceased.heirs.addressDetail.city,
      KecamatanAhliWaris: deceased.heirs.addressDetail.district,
      KelurahanAhliWaris: deceased.heirs.addressDetail.neighborhood,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reservasi');

    XLSX.writeFile(
      workbook,
      `reservation-${dayjs().format('DD-MM-YYYY')}.xlsx`
    );
  }, [data?.deceaseds]);

  useEffect(() => {
    setSearchParams({
      search: defferedSearch,
      page: deferredPage,
      size: defferedSize,
    });
  }, [setSearchParams, defferedSearch, deferredPage, defferedSize]);

  useEffect(() => {
    if (fetcher.data?.data.deceased?.status || id) {
      reset({
        id: `${id}`,
        status:
          fetcher.data?.data.deceased?.status === 'terverifikasi'
            ? 'terverifikasi'
            : 'belum_terverifikasi',
      });
    }
  }, [reset, id]);

  return (
    <>
      <div className='h-full w-full flex flex-col gap-4'>
        <Table
          data={data.deceaseds as unknown as DeceasedAssociation[]}
          columns={columns}
          isHasSearch
          search={search || ''}
          onChangeSearch={setSearch}
          searchInputPlaceholder='Cari reservasi'
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
                Detail Reservasi Makam
              </p>
              <DialogClose>
                <X className='h-4 w-4' />
              </DialogClose>
            </div>
          </DialogTitle>
          <DialogDescription className='py-4'>
            <div className='max-h-[30rem] px-2 overflow-y-auto flex flex-col gap-3'>
              <div className='w-full bg-neutral-50 grid grid-cols-3 gap-2 rounded-md overflow-clip'>
                {tabs.map((tab) => (
                  <div
                    className={cn(
                      'p-2 bg-neutral-50 text-neutral-800 rounded-lg flex items-center justify-center cursor-pointer',
                      activeTab === tab.value
                        ? 'bg-primary-500 text-neutral-50'
                        : 'text-neutral-900'
                    )}
                    onClick={() => setActiveTab(tab.value)}
                  >
                    {tab.label}
                  </div>
                ))}
              </div>
              <div className='flex flex-col gap-3'>
                {activeTab === 'detail-tpu' && (
                  <div className='flex flex-col gap-2'>
                    <p className='text-lg text-base-900 font-medium'>
                      Detail TPU
                    </p>
                    <div className='flex flex-col gap-1'>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Lokasi TPU: </p>
                        <p className='text-base-900'>
                          {fetcher?.data?.data?.deceased?.graveyard?.name}
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Jenis Pemakaman: </p>
                        <p className='text-base-900'>
                          {
                            graveyardTypeOptions.find(
                              (type) =>
                                type.value ===
                                fetcher?.data?.data?.deceased?.graveyard?.type
                            )?.label
                          }
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Agama: </p>
                        <p className='text-base-900'>
                          {
                            religionOptions.find(
                              (type) =>
                                type.value ===
                                fetcher?.data?.data?.deceased?.graveyard
                                  ?.religion
                            )?.label
                          }
                        </p>
                      </div>
                      <div className='flex flex-col'>
                        <p className='text-neutral-600 whitespace-nowrap'>
                          Alamat TPU:{' '}
                        </p>
                        <p className='text-base-900'>
                          {fetcher?.data?.data?.deceased?.graveyard?.address}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'data-almarhum' && (
                  <div className='flex flex-col gap-2'>
                    <p className='text-lg text-base-900 font-medium'>
                      Data Almarhum
                    </p>
                    <div className='flex flex-col gap-1'>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Nama Almarhum: </p>
                        <p className='text-base-900'>
                          {fetcher?.data?.data?.deceased?.name}
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Binti: </p>
                        <p className='text-base-900'>
                          {fetcher?.data?.data?.deceased?.fatherInLawName}
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Nomor KTP: </p>
                        <p className='text-base-900'>
                          {fetcher?.data?.data?.deceased?.idCard}
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Jenis Kelamin: </p>
                        <p className='text-base-900'>
                          {
                            genderOptions.find(
                              (item) =>
                                item.value ===
                                fetcher?.data?.data?.deceased?.Gender
                            )?.label
                          }
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Tempat Lahir: </p>
                        <p className='text-base-900'>
                          {fetcher?.data?.data?.deceased?.placeOfBirth}
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Tanggal Lahir: </p>
                        <p className='text-base-900'>
                          {dayjs(
                            fetcher?.data?.data?.deceased?.dateOfBirth
                          ).format('DD MMMM YYYY')}
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Tanggal Meninggal: </p>
                        <p className='text-base-900'>
                          {dayjs(
                            fetcher?.data?.data?.deceased?.dateOfDeath
                          ).format('DD MMMM YYYY')}
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>
                          Tanggal Dimakamankan:{' '}
                        </p>
                        <p className='text-base-900'>
                          {dayjs(
                            fetcher?.data?.data?.deceased?.burialDate
                          ).format('DD MMMM YYYY')}
                        </p>
                      </div>
                    </div>
                    <div className='w-full h-[1px] bg-neutral-50'></div>
                    <p className='text-lg text-base-900 font-medium'>
                      Alamat Almarhum
                    </p>
                    <div className='flex flex-col gap-1'>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Nomor Rumah: </p>
                        <p className='text-base-900'>
                          {
                            fetcher?.data?.data?.deceased?.addressDetail
                              ?.homeNumber
                          }
                        </p>
                      </div>
                      <div className='flex flex-col gap-1'>
                        <p className='text-neutral-600'>Alamat: </p>
                        <p className='text-base-900'>
                          {fetcher?.data?.data?.deceased?.addressDetail?.street}
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>RT: </p>
                        <p className='text-base-900'>
                          {fetcher?.data?.data?.deceased?.addressDetail?.rt}
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>RW: </p>
                        <p className='text-base-900'>
                          {fetcher?.data?.data?.deceased?.addressDetail?.rw}
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Provinsi: </p>
                        <p className='text-base-900'>
                          {
                            fetcher?.data?.data?.deceased?.addressDetail?.province?.split(
                              '-'
                            )[1]
                          }
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Kota: </p>
                        <p className='text-base-900'>
                          {
                            fetcher?.data?.data?.deceased?.addressDetail?.city?.split(
                              '-'
                            )[1]
                          }
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Kecamatan: </p>
                        <p className='text-base-900'>
                          {
                            fetcher?.data?.data?.deceased?.addressDetail?.district?.split(
                              '-'
                            )[1]
                          }
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Kelurahan: </p>
                        <p className='text-base-900'>
                          {
                            fetcher?.data?.data?.deceased?.addressDetail?.neighborhood?.split(
                              '-'
                            )[1]
                          }
                        </p>
                      </div>
                    </div>
                    <div className='w-full h-[1px] bg-neutral-50'></div>
                    <p className='text-lg text-base-900 font-medium'>
                      Lampiran File
                    </p>
                    <div className='grid grid-cols-1 gap-2'>
                      <div className='flex flex-col gap-1'>
                        <p className='text-neutral-600'>Lampiran KTP: </p>
                        <img
                          src={
                            fetcher?.data?.data?.deceased?.additionalFile
                              ?.ktpUrl || ''
                          }
                          alt='KTP'
                          className='h-[12.5rem] w-full object-cover'
                        />
                      </div>
                      <div className='flex flex-col gap-1'>
                        <p className='text-neutral-600'>
                          Lampiran Surat Kematian:{' '}
                        </p>
                        <img
                          src={
                            fetcher?.data?.data?.deceased?.additionalFile
                              ?.certificateUrl || ''
                          }
                          alt='surat kematian'
                          className='h-[12.5rem] w-full object-cover'
                        />
                      </div>
                      <div className='flex flex-col gap-1'>
                        <p className='text-neutral-600'>
                          Lampiran Surat Keterangan tidak mampu:{' '}
                        </p>
                        {fetcher?.data?.data?.deceased?.additionalFile
                          ?.incapabilityCertificateUrl ? (
                          <img
                            src={
                              fetcher?.data?.data?.deceased?.additionalFile
                                ?.incapabilityCertificateUrl || ''
                            }
                            alt='sktm'
                            className='h-[12.5rem] w-full object-cover'
                          />
                        ) : (
                          <p className='text-base-900'>-</p>
                        )}
                      </div>
                    </div>
                    <div className='w-full h-[1px] bg-neutral-50'></div>
                  </div>
                )}
                {activeTab === 'data-ahli-waris' && (
                  <div className='flex flex-col gap-2'>
                    <p className='text-lg text-base-900 font-medium'>
                      Data Ahli Waris
                    </p>
                    <div className='flex flex-col gap-1'>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Nama ahli waris: </p>
                        <p className='text-base-900'>
                          {fetcher?.data?.data?.deceased?.heirs?.name}
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Nomor Telepon: </p>
                        <p className='text-base-900'>
                          +62
                          {fetcher?.data?.data?.deceased?.heirs?.phoneNumber}
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Nomor KTP: </p>
                        <p className='text-base-900'>
                          {fetcher?.data?.data?.deceased?.heirs?.idCard}
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Pekerjaan: </p>
                        <p className='text-base-900'>
                          {fetcher?.data?.data?.deceased?.heirs?.job}
                        </p>
                      </div>
                    </div>
                    <div className='w-full h-[1px] bg-neutral-50'></div>
                    <p className='text-lg text-base-900 font-medium'>
                      Alamat Ahli Waris
                    </p>
                    <div className='flex flex-col gap-1'>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Nomor Rumah: </p>
                        <p className='text-base-900'>
                          {
                            fetcher?.data?.data?.deceased?.heirs?.addressDetail
                              ?.homeNumber
                          }
                        </p>
                      </div>
                      <div className='flex flex-col gap-1'>
                        <p className='text-neutral-600'>Alamat: </p>
                        <p className='text-base-900'>
                          {
                            fetcher?.data?.data?.deceased?.heirs?.addressDetail
                              ?.street
                          }
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>RT: </p>
                        <p className='text-base-900'>
                          {
                            fetcher?.data?.data?.deceased?.heirs?.addressDetail
                              ?.rt
                          }
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>RW: </p>
                        <p className='text-base-900'>
                          {
                            fetcher?.data?.data?.deceased?.heirs?.addressDetail
                              ?.rw
                          }
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Provinsi: </p>
                        <p className='text-base-900'>
                          {
                            fetcher?.data?.data?.deceased?.heirs?.addressDetail?.province?.split(
                              '-'
                            )[1]
                          }
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Kota: </p>
                        <p className='text-base-900'>
                          {
                            fetcher?.data?.data?.deceased?.heirs?.addressDetail?.city?.split(
                              '-'
                            )[1]
                          }
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Kecamatan: </p>
                        <p className='text-base-900'>
                          {
                            fetcher?.data?.data?.deceased?.heirs?.addressDetail?.district?.split(
                              '-'
                            )[1]
                          }
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-neutral-600'>Kelurahan: </p>
                        <p className='text-base-900'>
                          {
                            fetcher?.data?.data?.deceased?.heirs?.addressDetail?.neighborhood?.split(
                              '-'
                            )[1]
                          }
                        </p>
                      </div>
                    </div>
                    <div className='w-full h-[1px] bg-neutral-50'></div>
                    <p className='text-lg text-base-900 font-medium'>
                      Lampiran File
                    </p>
                    <div className='grid grid-cols-1 gap-2'>
                      <div className='flex flex-col gap-1'>
                        <p className='text-neutral-600'>Lampiran KTP: </p>
                        <img
                          src={
                            fetcher?.data?.data?.deceased?.heirs?.additionalFile
                              ?.ktpUrl || ''
                          }
                          alt='KTP'
                          className='h-[12.5rem] w-full object-cover'
                        />
                      </div>
                    </div>
                    <div className='w-full h-[1px] bg-neutral-50'></div>
                  </div>
                )}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='w-full sm:justify-normal grow'>
          <fetcher.Form onSubmit={handleSubmit} method='post'>
            <div className='flex flex-col gap-2'>
              <Controller
                control={control}
                name='status'
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Pilih status' />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions?.map((status) => (
                        <SelectItem value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <div className='flex items-center gap-4 justify-end'>
                <DialogClose asChild>
                  <Button text='Batalkan' variant='outline' />
                </DialogClose>
                <Button text='Update' type='submit' />
              </div>
            </div>
          </fetcher.Form>
        </DialogFooter>
      </DialogContent>
    </>
  );
}
