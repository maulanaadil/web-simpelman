import type { Garden, User } from '@prisma/client';
import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { Controller } from 'react-hook-form';
import { redirectWithSuccess } from 'remix-toast';
import invariant from 'tiny-invariant';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import Banner from '~/components/banner';
import Button from '~/components/button';
import InputText from '~/components/input-text';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import { complaints } from '~/constants/feedback';
import useCustomForm from '~/hooks/useCustomForm';
import { MainLayout } from '~/layouts/main';
import { prisma } from '~/services/db.server';
import { sessionStorage } from '~/services/session.server';
import { ActionErrors, validateAction } from '~/utils/common/validate';

type LoaderData = {
  user: Pick<User, 'email' | 'name'>;
  garden: Omit<Garden, 'createdAt' | 'updatedAt'> | null;
};

const schema = zfd.formData(
  z.object({
    email: z.string().email('Must be a valid email'),
    about: z
      .enum(['infrastructural_facilities', 'service', 'location', 'advice'])
      .nullable(),
    message: z
      .string()
      .min(10, { message: 'Message must be at least 10 characters' }),
  })
);

type FeedbackSchema = z.infer<typeof schema>;

export async function loader({ request, params }: LoaderFunctionArgs) {
  const cookieString = request.headers.get('Cookie');

  const user = (await sessionStorage.parse(cookieString)) as LoaderData['user'];

  const garden = await prisma.garden.findUnique({
    where: {
      id: params.id,
    },
  });

  return json<LoaderData>({ user, garden });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { errors, formData } = await validateAction<FeedbackSchema>({
    request,
    schema,
  });

  if (errors) {
    return json<
      Partial<
        FeedbackSchema & {
          errors: ActionErrors<FeedbackSchema>;
        }
      >
    >(
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
      email: formData.email,
      about: formData.about!,
      content: formData.message,
      gardenId: params.id || '',
    },
  });

  return redirectWithSuccess('/services/garden', {
    message: 'Berhasil mengirimkan pesan',
  });
}

export default function GardenDetail() {
  const { user, garden } = useLoaderData<LoaderData>();

  return (
    <MainLayout user={user}>
      <Banner
        title={garden?.name || ''}
        subtitle={
          <div className='flex flex-col gap-3 '>
            <p className='text-sm text-base-50'>
              {garden?.type === 'square' ? 'Alun alun' : 'Pemda'}
            </p>
            <p className='text-sm text-base-50'>{garden?.address}</p>
          </div>
        }
        breadcrumbs={[
          { label: 'Layanan', href: '/services' },
          { label: 'Pertamanan', href: '/services/garden' },
          { label: garden?.name || '', href: `/services/${garden?.id}` },
        ]}
      />
      <div className='py-10 container'>
        <img
          src={garden?.imageUrl}
          alt={garden?.name}
          className='w-full h-[31.25rem] object-cover rounded-lg'
        />

        <div className='flex flex-col gap-6 mt-10'>
          <p className='text-2xl font-bold text-base-900'>Saran</p>
          <Form className='flex flex-col gap-4' method='post'>
            <InputText
              label={
                <>
                  Email <span className='text-danger-500'>*</span>
                </>
              }
              name='email'
              type='email'
              placeholder='Masukan email'
            />
            <div className='flex flex-col gap-2'>
              <p className="'text-base-700 font-medium text-sm mb-2'">
                Tentang <span className='text-danger-500'>*</span>
              </p>
              <Select name='about'>
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
            </div>
            <div className='flex flex-col gap-2'>
              <p className="'text-base-700 font-medium text-sm mb-2'">
                Pesan <span className='text-danger-500'>*</span>
              </p>
              <Textarea name='message' placeholder='Tulis pesan anda' />
            </div>
            <Button size='full' type='submit' text='Kirim Pesan' />
          </Form>
        </div>
      </div>
    </MainLayout>
  );
}
