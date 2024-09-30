import { zodResolver } from '@hookform/resolvers/zod';
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  NodeOnDiskFile,
  redirect,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { Controller } from 'react-hook-form';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { GardenAssociation } from 'types/model';
import { z } from 'zod';
import Banner from '~/components/banner';
import Button from '~/components/button';
import InputText from '~/components/input-text';
import InputUpload, { UploadValue } from '~/components/input-upload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import { complaints } from '~/constants/feedback';
import { MainLayout } from '~/layouts/main';
import { prisma } from '~/services/db.server';
import { sessionStorage } from '~/services/session.server';

type LoaderData = {
  data: {
    garden: GardenAssociation;
  };
};

const schema = z.object({
  email: z.string().email('Must be a valid email'),
  about: z.enum([
    'infrastructural_facilities',
    'service',
    'location',
    'advice',
  ]),
  photos: z.custom<UploadValue[] | undefined>().optional(),
  message: z
    .string()
    .min(10, { message: 'Message must be at least 10 characters' }),
});

type FeedbackSchema = z.infer<typeof schema>;

export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie')
  );

  const garden = await prisma.garden.findUnique({
    where: {
      id: params.id,
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
    return redirect('/services/garden', {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    });
  }

  return json<LoaderData>({
    data: {
      garden: {
        ...garden,
        photos: garden.photo,
      },
    },
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie')
  );

  const formData = await unstable_parseMultipartFormData(
    request,
    unstable_composeUploadHandlers(
      unstable_createFileUploadHandler({
        directory: './public/images/feedback',
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
        url: `/images/feedback/${file.name}`,
      })),
    });
  }

  const { errors, data } = await getValidatedFormData<FeedbackSchema>(
    formData,
    zodResolver(schema)
  );

  if (errors) {
    return json(
      {
        email: undefined,
        about: undefined,
        message: undefined,
        errors,
      },
      { status: 400 }
    );
  }

  await prisma.feedback.create({
    data: {
      email: data.email,
      about: data.about!,
      content: data.message,
      gardenId: params.id || '',
      photo: {
        create: data?.photos?.map((photo) => ({
          imageUrl: photo.url,
        })),
      },
    },
  });

  session.flash('toast', {
    type: 'success',
    message: 'Berhasil mengirimkan pesan',
  });

  return redirect('/services/garden', {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  });
}

export default function GardenDetail() {
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useRemixForm<FeedbackSchema>({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
  });
  const loaderData = useLoaderData<LoaderData>();

  return (
    <MainLayout>
      <Banner
        title={loaderData.data?.garden?.name || ''}
        subtitle={
          <div className='flex flex-col gap-3 '>
            <p className='text-sm text-base-50'>
              {loaderData.data?.garden?.type === 'square'
                ? 'Alun alun'
                : 'Pemda'}
            </p>
            <p className='text-sm text-base-50'>
              {loaderData.data?.garden?.address}
            </p>
          </div>
        }
        breadcrumbs={[
          { label: 'Layanan', href: '/services' },
          { label: 'Pertamanan', href: '/services/garden' },
          {
            label: loaderData.data?.garden?.name || '',
            href: `/services/${loaderData.data?.garden?.id}`,
          },
        ]}
      />
      <div className='py-10 container'>
        <div className='grid grid-cols-4 gap-3'>
          <img
            src={loaderData.data?.garden?.photos[0].imageUrl}
            alt={loaderData.data?.garden?.photos[0].id}
            className='w-full h-[31.25rem] col-span-3 object-cover rounded-lg'
          />
          <div className='flex flex-col gap-2'>
            {loaderData.data?.garden?.photos.slice(1, 3).map((photo) => (
              <img
                src={photo.imageUrl}
                alt={photo.id}
                className='w-full h-[15.625rem] object-cover rounded-lg'
              />
            ))}
          </div>
        </div>

        <div className='flex flex-col gap-6 mt-10'>
          <p className='text-2xl font-bold text-base-900'>Saran</p>
          <Form
            className='flex flex-col gap-4'
            method='post'
            onSubmit={handleSubmit}
            encType='multipart/form-data'
          >
            <InputText
              label={
                <>
                  Email <span className='text-danger-500'>*</span>
                </>
              }
              name='email'
              type='email'
              isHookForm
              control={control}
              controlName='email'
              placeholder='Masukan email'
              error={errors?.email?.message}
            />
            <Controller
              control={control}
              name='about'
              render={({ field }) => (
                <div className='flex flex-col gap-2'>
                  <p className="'text-base-700 font-medium text-sm mb-2'">
                    Tentang <span className='text-danger-500'>*</span>
                  </p>
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Pilih jenis keluhan' />
                    </SelectTrigger>
                    <SelectContent>
                      {complaints.map((complaint) => (
                        <SelectItem value={complaint.value}>
                          {complaint.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors?.about?.message && (
                    <p className='text-danger-500 text-sm'>
                      {errors?.about?.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              control={control}
              name='message'
              render={({ field }) => (
                <div className='flex flex-col gap-2'>
                  <p className="'text-base-700 font-medium text-sm mb-2'">
                    Pesan <span className='text-danger-500'>*</span>
                  </p>
                  <Textarea
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    name='message'
                    placeholder='Tulis pesan anda'
                  />
                  {errors?.message?.message && (
                    <p className='text-danger-500 text-sm'>
                      {errors?.message?.message}
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
                  label='Masukan gambar'
                  isRequired
                  isMultiple
                  desc='Upload Gambar taman dengan format “.jpg , .png”'
                  onChange={(value) => field.onChange(value)}
                  value={field?.value as UploadValue[]}
                  error={errors.photos?.message}
                />
              )}
            />
            <Button size='full' type='submit' text='Kirim Pesan' />
          </Form>
        </div>
      </div>
    </MainLayout>
  );
}
