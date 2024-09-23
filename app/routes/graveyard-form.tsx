import { zodResolver } from '@hookform/resolvers/zod';
import { Gender, Graveyard } from '@prisma/client';
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
import { Form, useFetcher, useLoaderData, useNavigate } from '@remix-run/react';
import dayjs from 'dayjs';
import { BackSquare } from 'iconsax-react';
import { CalendarIcon, Check } from 'lucide-react';
import React, { FormEvent, useEffect, useRef, useState } from 'react';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { redirectWithSuccess } from 'remix-toast';
import { z } from 'zod';
import Button from '~/components/button';
import InputText from '~/components/input-text';
import InputUpload, { UploadValue } from '~/components/input-upload';
import { Calendar } from '~/components/ui/calendar';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {
  genderOptions,
  graveyardTypeOptions,
  jobOptions,
  religionOptions,
} from '~/constants/graveyard';
import Footer from '~/layouts/footer';
import api from '~/services/api/';
import {
  City,
  District,
  Neighborhood,
  Province,
} from '~/services/api/wilayahIndonesia';
import { prisma } from '~/services/db.server';
import { sessionStorage } from '~/services/session.server';
import { cn } from '~/utils/common/styles';

const STEPS = [
  {
    step: 1,
    description: 'Pengisian Wilayah TPU',
  },
  {
    step: 2,
    description: 'Pengisian Data Almarhum',
  },
  {
    step: 3,
    description: 'Pengisian Data Ahli Waris',
  },
];

type LoaderData = {
  graveyards: Graveyard[];
  graveyard?: Graveyard;
  provinceOptions: Province[];
  cityOptions?: City[];
  regencyOptions?: District[];
  neighborhoodOptions?: Neighborhood[];
};

const schema = z.object({
  graveyard: z.string(),
  type: z.string(),
  religion: z.string(),
  additionalInfo: z
    .array(
      z.object({
        hasKeteranganKurangMampu: z.boolean(),
      })
    )
    .optional(),
  address: z.string().optional(),
  numberOfGrave: z.number().optional(),
  name: z.string(),
  fatherInLawName: z.string(),
  idCard: z.string(),
  Gender: z.custom<Gender>(),
  placeOfBirth: z.string(),
  dateOfBirth: z.coerce.date(),
  dateOfDeath: z.coerce.date(),
  burialDate: z.coerce.date(),
  homeNumber: z.string(),
  street: z.string(),
  rt: z.string(),
  rw: z.string(),
  province: z.string(),
  city: z.string(),
  district: z.string(),
  neighborhood: z.string(),
  ktpUrl: z.custom<UploadValue>(
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
      message: 'File KTP Ahli Waris harus diisi',
    }
  ),
  certificateUrl: z.custom<UploadValue>(
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
      message: 'File KTP Ahli Waris harus diisi',
    }
  ),
  incapabilityCertificateUrl: z.custom<UploadValue>(),
  heirsName: z.string(),
  heirsIdCard: z.string(),
  heirsPhoneNumber: z.string(),
  heirsJob: z.string(),
  isHeirsAddressSame: z.boolean(),
  heirsHomeNumber: z.string(),
  heirsStreet: z.string(),
  heirsRt: z.string(),
  heirsRw: z.string(),
  heirsProvince: z.string(),
  heirsCity: z.string(),
  heirsDistrict: z.string(),
  heirsNeighborhood: z.string(),
  heirsKtpUrl: z.custom<UploadValue>(
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
      message: 'File KTP Ahli Waris harus diisi',
    }
  ),
});

type FormSchema = z.infer<typeof schema>;

export async function loader({ request }: LoaderFunctionArgs) {
  const graveyardId = new URL(request.url).searchParams.get('graveyardId');
  const provinceId = new URL(request.url).searchParams.get('provinceId');
  const cityId = new URL(request.url).searchParams.get('cityId');
  const districtId = new URL(request.url).searchParams.get('districtId');

  const graveyards = await prisma.graveyard.findMany();
  const provinceOptions = await api.wilayahIndonesia.getListProvince();
  const cityOptions = await api.wilayahIndonesia.getListCity({ provinceId });
  const regencyOptions = await api.wilayahIndonesia.getListRegency({ cityId });
  const neighborhoodOptions = await api.wilayahIndonesia.getListVillage({
    districtId,
  });

  if (graveyardId) {
    const graveyard = await prisma.graveyard.findUnique({
      where: {
        id: graveyardId,
      },
    });

    if (graveyard) {
      return json<LoaderData>({
        graveyards,
        graveyard,
        provinceOptions,
        cityOptions,
        regencyOptions,
        neighborhoodOptions,
      });
    }
  }

  return json<LoaderData>({
    graveyards,
    provinceOptions,
    cityOptions,
    regencyOptions,
    neighborhoodOptions,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie')
  );

  const user = session.get('user');

  const formData = await unstable_parseMultipartFormData(
    request,
    unstable_composeUploadHandlers(
      unstable_createFileUploadHandler({
        directory: './public/files',
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

  const { data, errors } = await getValidatedFormData<FormSchema>(
    formData,
    zodResolver(schema)
  );

  if (errors) {
    return json(
      {
        errors,
      },
      { status: 400 }
    );
  }

  const graveyard = await prisma.graveyard.findUnique({
    where: {
      id: data.graveyard,
    },
  });

  if (!graveyard) {
    return json(
      {
        errors: {
          graveyard: {
            message: 'TPU tidak ditemukan',
          },
        },
      },
      { status: 400 }
    );
  }

  const [deceased] = await prisma.$transaction([
    prisma.deceased.create({
      data: {
        name: data.name,
        fatherInLawName: data.fatherInLawName,
        idCard: data.idCard,
        Gender: data.Gender,
        placeOfBirth: data.placeOfBirth,
        dateOfBirth: data.dateOfBirth,
        dateOfDeath: data.dateOfDeath,
        burialDate: data.burialDate,
        graveyardId: data.graveyard,
        userId: user?.id,
        additionalInfo: data.additionalInfo || {},
      },
    }),
    prisma.graveyard.update({
      where: {
        id: data.graveyard,
      },
      data: {
        numberOfGrave: graveyard.numberOfGrave - 1,
      },
    }),
  ]);

  if (!deceased) {
    return json(
      {
        errors: {
          name: {
            message: 'Gagal membuat data almarhum',
          },
        },
      },
      { status: 400 }
    );
  }

  await prisma.addressDetail.create({
    data: {
      homeNumber: data.homeNumber,
      street: data.street,
      rt: data.rt,
      rw: data.rw,
      province: data.province,
      city: data.city,
      district: data.district,
      neighborhood: data.neighborhood,
      deceasedId: deceased.id,
    },
  });

  await prisma.additionalFile.create({
    data: {
      ktpUrl: data.ktpUrl.url,
      certificateUrl: data.certificateUrl.url,
      incapabilityCertificateUrl: data.incapabilityCertificateUrl?.url,
      deceasedId: deceased.id,
    },
  });

  const heirs = await prisma.heirs.create({
    data: {
      name: data.heirsName,
      idCard: data.heirsIdCard,
      phoneNumber: data.heirsPhoneNumber,
      job: data.heirsJob,
    },
  });

  const isHeirsAddressSame = data.isHeirsAddressSame;

  if (isHeirsAddressSame) {
    await prisma.addressDetail.create({
      data: {
        homeNumber: data.homeNumber,
        street: data.street,
        rt: data.rt,
        rw: data.rw,
        province: data.province,
        city: data.city,
        district: data.district,
        neighborhood: data.neighborhood,
        heirsId: heirs.id,
      },
    });
  } else {
    await prisma.addressDetail.create({
      data: {
        homeNumber: data.heirsHomeNumber,
        street: data.heirsStreet,
        rt: data.heirsRt,
        rw: data.heirsRw,
        province: data.heirsProvince,
        city: data.heirsCity,
        district: data.heirsDistrict,
        neighborhood: data.heirsNeighborhood,
        heirsId: heirs.id,
      },
    });
  }

  await prisma.additionalFile.create({
    data: {
      ktpUrl: data.heirsKtpUrl.url,
      heirsId: heirs.id,
    },
  });

  return redirectWithSuccess('/services/graveyard', {
    message: 'Data berhasil disimpan',
  });
}

export default function GraveyardForm() {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  const { graveyards, provinceOptions } = useLoaderData<LoaderData>();
  const [step, setStep] = useState(STEPS[0].step);
  const [checkedState, setCheckedState] = useState<number[]>([]);

  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useRemixForm<FormSchema>({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
    defaultValues: {
      dateOfBirth: new Date(2000, 8, 1),
      burialDate: new Date(2024, 5, 1),
      dateOfDeath: new Date(2024, 5, 1),
    },
  });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => handleSubmit(e);

  return (
    <div className='w-full h-full bg-base-50'>
      <div className='container py-[4.375rem]'>
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
        <Form
          ref={formRef}
          onSubmit={onSubmit}
          method='post'
          encType='multipart/form-data'
        >
          <Steps checkedStep={checkedState} step={step} />
          {step === 1 ? (
            <StepOne
              control={control}
              graveyards={graveyards}
              errors={errors}
              setValue={setValue}
            />
          ) : step === 2 ? (
            <StepTwo
              control={control}
              errors={errors}
              watch={watch}
              provinceOptions={provinceOptions}
            />
          ) : (
            <StepThree
              control={control}
              errors={errors}
              watch={watch}
              provinceOptions={provinceOptions}
              setValue={setValue}
            />
          )}
          <div className='flex justify-end mt-4 gap-4'>
            {step !== 1 && (
              <Button
                text='Kembali'
                variant='outline'
                type='button'
                onClick={() => {
                  setStep(step - 1);
                  setCheckedState(checkedState.filter((step) => step !== step));
                }}
              />
            )}
            <Button
              type='button'
              text={step === 3 ? 'Simpan Data' : 'Lanjutkan'}
              onClick={(e) => {
                if (step === 1 || step === 2) {
                  setStep(step + 1);
                  setCheckedState([...checkedState, step]);
                  return;
                } else {
                  formRef.current?.dispatchEvent(
                    new Event('submit', { cancelable: true, bubbles: true })
                  );
                }
              }}
            />
          </div>
        </Form>
      </div>
      <Footer />
    </div>
  );
}

function StepThree({
  control,
  errors,
  watch,
  provinceOptions,
  setValue,
}: {
  control: Control<FormSchema>;
  errors: FieldErrors<FormSchema>;
  watch: UseFormWatch<FormSchema>;
  setValue: UseFormSetValue<FormSchema>;
} & Partial<LoaderData>) {
  const fetcher = useFetcher<typeof loader>();

  const isHeirsAddressSame = watch('isHeirsAddressSame');

  useEffect(() => {
    if (isHeirsAddressSame) {
      setValue('heirsHomeNumber', watch('homeNumber'));
      setValue('heirsStreet', watch('street'));
      setValue('heirsRt', watch('rt'));
      setValue('heirsRw', watch('rw'));
      setValue('heirsProvince', watch('province'));
      setValue('heirsCity', watch('city'));
      setValue('heirsDistrict', watch('district'));
      setValue('heirsNeighborhood', watch('neighborhood'));
    }
  }, [isHeirsAddressSame]);

  return (
    <div className='p-5 bg-base-50 rounded-xl shadow border border-base-200 flex flex-col gap-10'>
      <div className='bg-base-200 rounded-xl p-5 flex flex-col gap-4'>
        <p className='text-2xl text-base-900 font-medium'>Data Ahli Waris</p>
        <p className=' text-base-400'>
          Siapkan beberapa persyaratan terkait registrasi pemakaman baru
        </p>
      </div>
      <div className='flex flex-col gap-8 px-4'>
        <div className='flex flex-col gap-3'>
          <p className='text-xl text-base-900 font-medium'>
            Data Diri Ahli Waris
          </p>
          <div className='grid grid-cols-2 gap-8'>
            <InputText
              label={
                <>
                  Nama Ahli Waris <span className='text-danger-500'>*</span>
                </>
              }
              isHookForm
              control={control}
              controlName='heirsName'
              error={errors?.heirsName?.message}
              description='Masukan nama Almahum tanpa Gelar seperti “adam mukhalir”'
              placeholder='Masukan nama'
            />
            <InputText
              label={
                <>
                  Nomor Telepon <span className='text-danger-500'>*</span>
                </>
              }
              isHookForm
              control={control}
              placeholder='Masukan nomor telepon'
              description="Nomor HP tidak boleh dimulai dengan '62'"
              controlName='heirsPhoneNumber'
              isPrefix
              renderPrefix={
                <div className='p-4 rounded-lg border border-base-300 justify-center items-center flex text-sm text-base-400'>
                  +62
                </div>
              }
              error={errors?.heirsPhoneNumber?.message}
            />
            <InputText
              label={
                <>
                  Nomor KTP <span className='text-danger-500'>*</span>
                </>
              }
              isHookForm
              control={control}
              controlName='heirsIdCard'
              error={errors?.heirsIdCard?.message}
              description='Masukan Digit Nomor KTP'
              placeholder='Masukan nomor KTP'
              name='heirsIdCard'
            />
            <Controller
              control={control}
              name='heirsJob'
              render={({ field }) => (
                <div className='flex flex-col gap-2 mb-2'>
                  <div className='flex flex-col'>
                    <p className='text-base-700 font-medium text-sm'>
                      Pekerjaan <span className='text-danger-500'>*</span>
                    </p>
                    <p className='text-base-400 text-xs'>Masukan pekerjaan</p>
                  </div>
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Pilih jenis pemakaman' />
                    </SelectTrigger>
                    <SelectContent>
                      {jobOptions.map((type) => (
                        <SelectItem value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors?.heirsJob?.message && (
                    <p className='text-danger-500 text-sm'>
                      {errors?.heirsJob?.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </div>
        <div className='flex flex-col gap-3'>
          <div className='flex items-center gap-4'>
            <p className='text-xl text-base-900 font-medium'>
              Alamat Ahli Waris
            </p>
            <Controller
              control={control}
              name='isHeirsAddressSame'
              render={({ field }) => (
                <div className='flex items-center gap-2'>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <p className='text-base-900 text-sm font-light'>
                    Sama Dengan Alamat Almahum
                  </p>
                </div>
              )}
            />
          </div>
          <div className='grid grid-cols-2 gap-8'>
            <InputText
              label={
                <>
                  Nomor Rumah <span className='text-danger-500'>*</span>
                </>
              }
              isHookForm
              control={control}
              controlName='heirsHomeNumber'
              error={errors?.heirsHomeNumber?.message}
              description='Penomoran rumah'
              placeholder='Masukan nomor Rumah'
              name='heirsHomeNumber'
            />
            <InputText
              label={
                <>
                  Alamat Jalan <span className='text-danger-500'>*</span>
                </>
              }
              isHookForm
              control={control}
              controlName='heirsStreet'
              error={errors?.heirsStreet?.message}
              description='Masukan alamat seperti "Jln Dago"'
              placeholder='Masukan alamat'
              name='heirsStreet'
            />
            <InputText
              label={
                <>
                  RT <span className='text-danger-500'>*</span>
                </>
              }
              type='number'
              isHookForm
              control={control}
              controlName='heirsRt'
              error={errors?.heirsRt?.message}
              description='Masukan Nomor RT seperti "001"'
              placeholder='Masukan alamat'
              name='heirsRt'
            />
            <InputText
              label={
                <>
                  RW <span className='text-danger-500'>*</span>
                </>
              }
              type='number'
              isHookForm
              control={control}
              controlName='heirsRw'
              error={errors?.heirsRw?.message}
              description='Masukan Nomor RW seperti "002"'
              placeholder='Masukan alamat'
              name='heirsRw'
            />
            <div className='grid grid-cols-2 gap-6'>
              <Controller
                control={control}
                name='heirsProvince'
                render={({ field }) => (
                  <div className='flex flex-col gap-2 mb-2'>
                    <div className='flex flex-col'>
                      <p className='text-base-700 font-medium text-sm'>
                        Provinsi <span className='text-danger-500'>*</span>
                      </p>
                      <p className='text-base-400 text-xs'>Masukan provinsi</p>
                    </div>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        const [provinceId] = value.split('-');
                        field.onChange(value);
                        fetcher.load(
                          `/graveyard-form?provinceId=${provinceId}`
                        );
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Pilih provinsi' />
                      </SelectTrigger>
                      <SelectContent>
                        {provinceOptions?.map((province) => (
                          <SelectItem value={`${province.id}-${province.name}`}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors?.heirsProvince?.message && (
                      <p className='text-danger-500 text-sm'>
                        {errors?.heirsProvince?.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                control={control}
                name='heirsCity'
                render={({ field }) => (
                  <div className='flex flex-col gap-2 mb-2'>
                    <div className='flex flex-col'>
                      <p className='text-base-700 font-medium text-sm'>
                        Kota <span className='text-danger-500'>*</span>
                      </p>
                      <p className='text-base-400 text-xs'>Masukan kota</p>
                    </div>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        const [cityId] = value.split('-');
                        const [provinceId] = watch('heirsProvince').split('-');

                        field.onChange(value);
                        fetcher.load(
                          `/graveyard-form?provinceId=${provinceId}&cityId=${cityId}`
                        );
                      }}
                      disabled={!fetcher.data?.cityOptions?.length}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Pilih kota' />
                      </SelectTrigger>
                      <SelectContent>
                        {fetcher.data?.cityOptions?.map((province) => (
                          <SelectItem value={`${province.id}-${province.name}`}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors?.heirsCity?.message && (
                      <p className='text-danger-500 text-sm'>
                        {errors?.heirsCity?.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
            <div className='grid grid-cols-2 gap-6'>
              <Controller
                control={control}
                name='heirsDistrict'
                render={({ field }) => (
                  <div className='flex flex-col gap-2 mb-2'>
                    <div className='flex flex-col'>
                      <p className='text-base-700 font-medium text-sm'>
                        Kecamatan <span className='text-danger-500'>*</span>
                      </p>
                      <p className='text-base-400 text-xs'>Masukan kecamatan</p>
                    </div>
                    <Select
                      value={field.value}
                      disabled={!fetcher.data?.regencyOptions?.length}
                      onValueChange={(value) => {
                        const [districtId] = value.split('-');
                        const [provinceId] = watch('heirsProvince').split('-');
                        const [cityId] = watch('heirsCity').split('-');

                        field.onChange(value);
                        fetcher.load(
                          `/graveyard-form?provinceId=${provinceId}&cityId=${cityId}&districtId=${districtId}`
                        );
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Pilih kecamatan' />
                      </SelectTrigger>
                      <SelectContent>
                        {fetcher.data?.regencyOptions?.map((regency) => (
                          <SelectItem value={`${regency.id}-${regency.name}`}>
                            {regency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors?.heirsDistrict?.message && (
                      <p className='text-danger-500 text-sm'>
                        {errors?.heirsDistrict?.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                control={control}
                name='heirsNeighborhood'
                render={({ field }) => (
                  <div className='flex flex-col gap-2 mb-2'>
                    <div className='flex flex-col'>
                      <p className='text-base-700 font-medium text-sm'>
                        Kelurahan <span className='text-danger-500'>*</span>
                      </p>
                      <p className='text-base-400 text-xs'>Masukan kelurahan</p>
                    </div>
                    <Select
                      value={field.value}
                      disabled={!fetcher.data?.neighborhoodOptions?.length}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Pilih kelurahan' />
                      </SelectTrigger>
                      <SelectContent>
                        {fetcher.data?.neighborhoodOptions?.map(
                          (neighborhood) => (
                            <SelectItem
                              value={`${neighborhood.id}-${neighborhood.name}`}
                            >
                              {neighborhood.name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    {errors?.heirsNeighborhood?.message && (
                      <p className='text-danger-500 text-sm'>
                        {errors?.heirsNeighborhood?.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-3'>
          <p className='text-xl text-base-900 font-medium'>Lampirkan File</p>
          <Controller
            control={control}
            name='heirsKtpUrl'
            render={({ field }) => (
              <InputUpload
                label='File KTP Ahli Waris'
                isRequired
                desc='Upload File KTP dengan Almarhum dengan format “.jpg , .png”'
                onChange={(value) => field.onChange(value)}
                value={field.value}
                error={errors.ktpUrl?.message}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}

function StepTwo({
  control,
  errors,
  watch,
  provinceOptions,
}: {
  control: Control<FormSchema>;
  errors: FieldErrors<FormSchema>;
  watch: UseFormWatch<FormSchema>;
} & Partial<LoaderData>) {
  const fetcher = useFetcher<typeof loader>();

  return (
    <div className='p-5 bg-base-50 rounded-xl shadow border border-base-200 flex flex-col gap-10'>
      <div className='bg-base-200 rounded-xl p-5 flex flex-col gap-4'>
        <p className='text-2xl text-base-900 font-medium'>
          Administrasi Data almarhum
        </p>
        <p className=' text-base-400'>
          Siapkan beberapa persyaratan terkait registrasi pemakaman baru
        </p>
      </div>
      <div className='flex flex-col gap-8 px-4'>
        <div className='flex flex-col gap-3'>
          <p className='text-xl text-base-900 font-medium'>
            Data Diri Almarhum
          </p>
          <div className='grid grid-cols-2 gap-8'>
            <InputText
              label={
                <>
                  Nama Almarhum <span className='text-danger-500'>*</span>
                </>
              }
              isHookForm
              control={control}
              controlName='name'
              error={errors?.name?.message}
              description='Masukan nama Almahum tanpa Gelar seperti “adam mukhalir”'
              placeholder='Masukan nama'
            />
            <InputText
              label={
                <>
                  Binti <span className='text-danger-500'>*</span>
                </>
              }
              isHookForm
              control={control}
              controlName='fatherInLawName'
              error={errors?.fatherInLawName?.message}
              description='Masukan nama orang tua tanpa Gelar  “adam mukhalir”'
              placeholder='Masukan nama'
            />
            <InputText
              label={
                <>
                  Nomor KTP <span className='text-danger-500'>*</span>
                </>
              }
              isHookForm
              control={control}
              controlName='idCard'
              error={errors?.idCard?.message}
              description='Masukan Digit Nomor KTP'
              placeholder='Masukan nomor KTP'
              name='name'
            />
            <Controller
              control={control}
              name='Gender'
              render={({ field }) => (
                <div className='flex flex-col gap-2 mb-2'>
                  <div className='flex flex-col'>
                    <p className='text-base-700 font-medium text-sm'>
                      Jenis Kelamin <span className='text-danger-500'>*</span>
                    </p>
                    <p className='text-base-400 text-xs'>
                      Jenis kelamin dari almarhum
                    </p>
                  </div>
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Pilih jenis pemakaman' />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((type) => (
                        <SelectItem value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors?.Gender?.message && (
                    <p className='text-danger-500 text-sm'>
                      {errors?.Gender?.message}
                    </p>
                  )}
                </div>
              )}
            />
            <InputText
              label={
                <>
                  Tempat Lahir <span className='text-danger-500'>*</span>
                </>
              }
              isHookForm
              control={control}
              controlName='placeOfBirth'
              error={errors?.placeOfBirth?.message}
              description='Masukan Tempat Lahir Almahum, seperti “Bandung”'
              placeholder='Masukan Tempat Lahir'
              name='name'
            />
            <Controller
              control={control}
              name='dateOfBirth'
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <InputText
                      label={
                        <>
                          Tanggal Lahir{' '}
                          <span className='text-danger-500'>*</span>
                        </>
                      }
                      isFixed
                      fixedLabel={<CalendarIcon className='text-base-400' />}
                      description='Tanggal lahir dari almarhum'
                      value={dayjs(field.value).format('DD MMMM YYYY')}
                      placeholder='Pilih Tanggal Lahir'
                    />
                  </PopoverTrigger>
                  {errors?.dateOfBirth?.message && (
                    <p className='text-danger-500 text-sm'>
                      {errors?.dateOfBirth?.message}
                    </p>
                  )}
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      captionLayout='dropdown'
                      defaultMonth={new Date(2000, 8, 1)}
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>
        </div>
        <div className='flex flex-col gap-3'>
          <p className='text-xl text-base-900 font-medium'>Alamat Almarhum</p>
          <div className='grid grid-cols-2 gap-8'>
            <InputText
              label={
                <>
                  Nomor Rumah <span className='text-danger-500'>*</span>
                </>
              }
              isHookForm
              control={control}
              controlName='homeNumber'
              error={errors?.homeNumber?.message}
              description='Penomoran rumah'
              placeholder='Masukan nomor Rumah'
              name='homeNumber'
            />
            <InputText
              label={
                <>
                  Alamat Jalan <span className='text-danger-500'>*</span>
                </>
              }
              isHookForm
              control={control}
              controlName='street'
              error={errors?.street?.message}
              description='Masukan alamat seperti "Jln Dago"'
              placeholder='Masukan alamat'
              name='street'
            />
            <InputText
              label={
                <>
                  RT <span className='text-danger-500'>*</span>
                </>
              }
              type='number'
              isHookForm
              control={control}
              controlName='rt'
              error={errors?.rt?.message}
              description='Masukan Nomor RT seperti "001"'
              placeholder='Masukan alamat'
              name='rt'
            />
            <InputText
              label={
                <>
                  RW <span className='text-danger-500'>*</span>
                </>
              }
              type='number'
              isHookForm
              control={control}
              controlName='rw'
              error={errors?.rw?.message}
              description='Masukan Nomor RT seperti "002"'
              placeholder='Masukan alamat'
              name='rw'
            />
            <div className='grid grid-cols-2 gap-6'>
              <Controller
                control={control}
                name='province'
                render={({ field }) => (
                  <div className='flex flex-col gap-2 mb-2'>
                    <div className='flex flex-col'>
                      <p className='text-base-700 font-medium text-sm'>
                        Provinsi <span className='text-danger-500'>*</span>
                      </p>
                      <p className='text-base-400 text-xs'>Masukan provinsi</p>
                    </div>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        const [provinceId] = value.split('-');
                        field.onChange(value);
                        fetcher.load(
                          `/graveyard-form?provinceId=${provinceId}`
                        );
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Pilih provinsi' />
                      </SelectTrigger>
                      <SelectContent>
                        {provinceOptions?.map((province) => (
                          <SelectItem value={`${province.id}-${province.name}`}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors?.province?.message && (
                      <p className='text-danger-500 text-sm'>
                        {errors?.province?.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                control={control}
                name='city'
                render={({ field }) => (
                  <div className='flex flex-col gap-2 mb-2'>
                    <div className='flex flex-col'>
                      <p className='text-base-700 font-medium text-sm'>
                        Kota <span className='text-danger-500'>*</span>
                      </p>
                      <p className='text-base-400 text-xs'>Masukan kota</p>
                    </div>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        const [cityId] = value.split('-');
                        const [provinceId] = watch('province').split('-');

                        field.onChange(value);
                        fetcher.load(
                          `/graveyard-form?provinceId=${provinceId}&cityId=${cityId}`
                        );
                      }}
                      disabled={!fetcher.data?.cityOptions?.length}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Pilih kota' />
                      </SelectTrigger>
                      <SelectContent>
                        {fetcher.data?.cityOptions?.map((province) => (
                          <SelectItem value={`${province.id}-${province.name}`}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors?.city?.message && (
                      <p className='text-danger-500 text-sm'>
                        {errors?.city?.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
            <div className='grid grid-cols-2 gap-6'>
              <Controller
                control={control}
                name='district'
                render={({ field }) => (
                  <div className='flex flex-col gap-2 mb-2'>
                    <div className='flex flex-col'>
                      <p className='text-base-700 font-medium text-sm'>
                        Kecamatan <span className='text-danger-500'>*</span>
                      </p>
                      <p className='text-base-400 text-xs'>Masukan kecamatan</p>
                    </div>
                    <Select
                      value={field.value}
                      disabled={!fetcher.data?.regencyOptions?.length}
                      onValueChange={(value) => {
                        const [districtId] = value.split('-');
                        const [provinceId] = watch('province').split('-');
                        const [cityId] = watch('city').split('-');

                        field.onChange(value);
                        fetcher.load(
                          `/graveyard-form?provinceId=${provinceId}&cityId=${cityId}&districtId=${districtId}`
                        );
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Pilih kecamatan' />
                      </SelectTrigger>
                      <SelectContent>
                        {fetcher.data?.regencyOptions?.map((regency) => (
                          <SelectItem value={`${regency.id}-${regency.name}`}>
                            {regency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors?.district?.message && (
                      <p className='text-danger-500 text-sm'>
                        {errors?.district?.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                control={control}
                name='neighborhood'
                render={({ field }) => (
                  <div className='flex flex-col gap-2 mb-2'>
                    <div className='flex flex-col'>
                      <p className='text-base-700 font-medium text-sm'>
                        Kelurahan <span className='text-danger-500'>*</span>
                      </p>
                      <p className='text-base-400 text-xs'>Masukan kelurahan</p>
                    </div>
                    <Select
                      value={field.value}
                      disabled={!fetcher.data?.neighborhoodOptions?.length}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Pilih kelurahan' />
                      </SelectTrigger>
                      <SelectContent>
                        {fetcher.data?.neighborhoodOptions?.map(
                          (neighborhood) => (
                            <SelectItem
                              value={`${neighborhood.id}-${neighborhood.name}`}
                            >
                              {neighborhood.name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    {errors?.neighborhood?.message && (
                      <p className='text-danger-500 text-sm'>
                        {errors?.neighborhood?.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-3'>
          <p className='text-xl text-base-900 font-medium'>
            Tanggal Meninggal dan Dimakamkan
          </p>
          <div className='grid grid-cols-2 gap-8'>
            <Controller
              control={control}
              name='dateOfDeath'
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <InputText
                      label={
                        <>
                          Meninggal Pada Hari/Tanggal{' '}
                          <span className='text-danger-500'>*</span>
                        </>
                      }
                      isFixed
                      fixedLabel={<CalendarIcon className='text-base-400' />}
                      description='Tanggal meninggal dari almahum'
                      value={dayjs(field.value).format('DD MMMM YYYY')}
                      placeholder='Pilih Tanggal Lahir'
                    />
                  </PopoverTrigger>
                  {errors?.dateOfBirth?.message && (
                    <p className='text-danger-500 text-sm'>
                      {errors?.dateOfBirth?.message}
                    </p>
                  )}
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      defaultMonth={new Date(2024, 5, 1)}
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        watch('dateOfBirth') > date || date > new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            <Controller
              control={control}
              name='burialDate'
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <InputText
                      label={
                        <>
                          Dimakamkan Hari/Tanggal{' '}
                          <span className='text-danger-500'>*</span>
                        </>
                      }
                      isFixed
                      fixedLabel={<CalendarIcon className='text-base-400' />}
                      description='Tanggal dimakamnya dari almahum'
                      value={dayjs(field.value).format('DD MMMM YYYY')}
                      placeholder='Pilih Tanggal Lahir'
                    />
                  </PopoverTrigger>
                  {errors?.dateOfBirth?.message && (
                    <p className='text-danger-500 text-sm'>
                      {errors?.dateOfBirth?.message}
                    </p>
                  )}
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={field.value}
                      defaultMonth={new Date(2024, 5, 1)}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        watch('dateOfDeath') > date || date > new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>
        </div>
        <div className='flex flex-col gap-3'>
          <p className='text-xl text-base-900 font-medium'>
            Lampirkan File <span className='text-danger-500'>*</span>
          </p>
          <div className='grid grid-cols-2 gap-8'>
            <Controller
              control={control}
              name='ktpUrl'
              render={({ field }) => (
                <InputUpload
                  label='KTP almarhum'
                  isRequired
                  desc='Upload File KTP dengan Almarhum dengan format “.jpg , .png”'
                  onChange={(value) => field.onChange(value)}
                  value={field.value}
                  error={errors.ktpUrl?.message}
                />
              )}
            />
            <Controller
              control={control}
              name='certificateUrl'
              render={({ field }) => (
                <InputUpload
                  label='File surat kematian'
                  isRequired
                  desc='Upload File Surat Kematian  Almarhum dengan format “.jpg , .png”'
                  onChange={(value) => field.onChange(value)}
                  value={field.value}
                  error={errors.certificateUrl?.message}
                />
              )}
            />
          </div>
          <div className='w-full'>
            <Controller
              control={control}
              name='incapabilityCertificateUrl'
              render={({ field }) => (
                <InputUpload
                  label={
                    <>
                      Surat keterangan tidak mampu{' '}
                      <span className='text-neutral-500'>(optional)</span>
                    </>
                  }
                  desc='Upload File  Surat Keterangan Tidak Mampu “.jpg , .png”'
                  onChange={(value) => field.onChange(value)}
                  value={field.value}
                  error={errors.incapabilityCertificateUrl?.message}
                />
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepOne({
  graveyards,
  errors,
  control,
  setValue,
}: {
  graveyards: Omit<Graveyard, 'createdAt' | 'updatedAt'>[];
  errors: FieldErrors<FormSchema>;
  control: Control<FormSchema>;
  setValue: UseFormSetValue<FormSchema>;
}) {
  const fetcher = useFetcher<typeof loader>();

  useEffect(() => {
    if (fetcher.data?.graveyard) {
      setValue('numberOfGrave', fetcher.data?.graveyard?.numberOfGrave);
      setValue('address', fetcher.data?.graveyard?.address);
    }
  }, [fetcher.data?.graveyard]);

  return (
    <div className='p-5 bg-base-50 rounded-xl shadow border border-base-200 flex flex-col gap-10'>
      <div className='bg-base-200 rounded-xl p-5 flex flex-col gap-4'>
        <p className='text-2xl text-base-900 font-medium'>
          Pengisian Wilayah TPU
        </p>
        <p className=' text-base-400'>
          Siapkan beberapa persyaratan terkait registrasi pemakaman baru
        </p>
      </div>
      <div className='flex flex-col gap-8 px-4'>
        <p className='text-xl text-base-900 font-medium'>Pemilihan TPU</p>
        <div className='grid grid-cols-2 gap-8'>
          <Controller
            control={control}
            name='graveyard'
            render={({ field }) => (
              <div className='flex flex-col gap-2 mb-2'>
                <div className='flex flex-col'>
                  <p className='text-base-700 font-medium text-sm'>
                    Lokasi TPU <span className='text-danger-500'>*</span>
                  </p>
                  <p className="'text-base-400 text-xs'">Masukan Lokasi TPU</p>
                </div>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    fetcher.load(`/graveyard-form?graveyardId=${value}`);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Pilih pemakaman' />
                  </SelectTrigger>
                  <SelectContent>
                    {graveyards.map((graveyard) => (
                      <SelectItem value={graveyard.id}>
                        {graveyard.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors?.graveyard?.message && (
                  <p className='text-danger-500 text-sm'>
                    {errors?.graveyard?.message}
                  </p>
                )}
              </div>
            )}
          />
          <Controller
            control={control}
            name='type'
            render={({ field }) => (
              <div className='flex flex-col gap-2 mb-2'>
                <div className='flex flex-col'>
                  <p className='text-base-700 font-medium text-sm'>
                    Jenis Pemakaman <span className='text-danger-500'>*</span>
                  </p>
                  <p className="'text-base-400 text-xs'">
                    Masukan Jenis Pemakaman
                  </p>
                </div>
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Pilih jenis pemakaman' />
                  </SelectTrigger>
                  <SelectContent>
                    {graveyardTypeOptions.map((type) => (
                      <SelectItem value={type.value}>{type.label}</SelectItem>
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
                  <p className="'text-base-400 text-xs'">
                    Masukan Agama Almarhum
                  </p>
                </div>
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Pilih agama' />
                  </SelectTrigger>
                  <SelectContent>
                    {religionOptions.map((type) => (
                      <SelectItem value={type.value}>{type.label}</SelectItem>
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
          <Controller
            control={control}
            name='additionalInfo'
            render={({ field }) => (
              <div className='flex flex-col gap-2 mb-2'>
                <div className='flex flex-col'>
                  <p className='text-base-700 font-medium text-sm'>
                    Keterangan Kurang Mampu{' '}
                  </p>
                  <p className="'text-base-400 text-xs'">
                    Apakah Memiliki Surat Keterangan Kurang mampu?
                  </p>
                </div>
                <div className='flex items-center gap-2 mt-4'>
                  <Checkbox
                    checked={
                      field.value?.find((info) => info.hasKeteranganKurangMampu)
                        ?.hasKeteranganKurangMampu
                    }
                    onCheckedChange={(check) => {
                      field.onChange([
                        {
                          hasKeteranganKurangMampu: check,
                        },
                      ]);
                    }}
                  />
                  <p className='text-base-900 font-light'>Tidak mampu</p>
                </div>
                {errors?.additionalInfo?.message && (
                  <p className='text-danger-500 text-sm'>
                    {errors?.additionalInfo?.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>
      </div>
      <div className='flex flex-col gap-8 px-4'>
        <p className='text-xl text-base-900 font-medium'>
          Informasi Lokasi TPU
        </p>
        <div className='grid grid-cols-2 gap-8'>
          <InputText
            label='Jumlah makam yang tersedia'
            placeholder='-'
            isHookForm
            control={control}
            controlName='numberOfGrave'
            disabled
          />
          <InputText
            label='Alamat lengkap tpu'
            placeholder='-'
            disabled
            isHookForm
            control={control}
            controlName='address'
          />
        </div>
      </div>
    </div>
  );
}

function Steps({ checkedStep, step }: { checkedStep: number[]; step: number }) {
  return (
    <div className='py-6 flex gap-4 justify-center items-center'>
      {STEPS.map((data, idx) => (
        <React.Fragment key={data.step}>
          <Step
            step={data.step}
            isChecked={checkedStep.includes(data.step)}
            description={data.description}
            isActive={data.step === step}
          />
          {idx !== STEPS.length - 1 && <StepDivider />}
        </React.Fragment>
      ))}
    </div>
  );
}

function StepDivider() {
  return (
    <svg
      width='80'
      height='32'
      viewBox='0 0 80 32'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g clip-path='url(#clip0_211_695)'>
        <circle cx='1.5' cy='16' r='1.5' fill='#9A9A9A' />
        <circle cx='7.5' cy='16' r='1.5' fill='#9A9A9A' />
        <circle cx='13.5' cy='16' r='1.5' fill='#9A9A9A' />
        <circle cx='19.5' cy='16' r='1.5' fill='#9A9A9A' />
        <circle cx='25.5' cy='16' r='1.5' fill='#9A9A9A' />
        <circle cx='31.5' cy='16' r='1.5' fill='#9A9A9A' />
        <circle cx='37.5' cy='16' r='1.5' fill='#9A9A9A' />
        <circle cx='43.5' cy='16' r='1.5' fill='#9A9A9A' />
        <circle cx='49.5' cy='16' r='1.5' fill='#9A9A9A' />
        <circle cx='55.5' cy='16' r='1.5' fill='#9A9A9A' />
        <circle cx='61.5' cy='16' r='1.5' fill='#9A9A9A' />
        <circle cx='67.5' cy='16' r='1.5' fill='#9A9A9A' />
        <circle cx='73.5' cy='16' r='1.5' fill='#9A9A9A' />
        <circle cx='79.5' cy='16' r='1.5' fill='#9A9A9A' />
      </g>
      <defs>
        <clipPath id='clip0_211_695'>
          <rect width='80' height='32' fill='white' />
        </clipPath>
      </defs>
    </svg>
  );
}

function Step({
  step,
  description,
  isActive,
  isChecked,
}: {
  step: number;
  description: string;
  isActive: boolean;
  isChecked: boolean;
}) {
  return (
    <div className='flex flex-col items-center justify-center gap-2.5'>
      <div
        className={cn(
          'w-fit rounded-full border-2 px-3 py-1.5',
          isActive ? 'border-primary-500' : 'border-base-400',
          isChecked
            ? 'bg-primary-500 border-primary-500 px-2 py-2'
            : 'bg-base-50'
        )}
      >
        {isChecked ? (
          <Check className='h-4 w-4 text-base-50' />
        ) : (
          <p
            className={cn(
              'text-sm font-medium',
              isActive ? 'text-primary-500 ' : 'text-base-900'
            )}
          >
            {step}
          </p>
        )}
      </div>
      <p
        className={cn(
          'text-sm font-semibold',
          isActive || isChecked ? 'text-primary-500 ' : 'text-base-900'
        )}
      >
        {description}
      </p>
    </div>
  );
}
