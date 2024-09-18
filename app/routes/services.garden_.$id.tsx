import { zodResolver } from '@hookform/resolvers/zod';
import type { Garden } from '@prisma/client';
import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { Controller } from 'react-hook-form';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { redirectWithSuccess } from 'remix-toast';
import { z } from 'zod';
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
import { MainLayout } from '~/layouts/main';
import { prisma } from '~/services/db.server';

type LoaderData = {
  garden: Omit<Garden, 'createdAt' | 'updatedAt'> | null;
};

const schema = z.object({
  email: z.string().email('Must be a valid email'),
  about: z.enum([
    'infrastructural_facilities',
    'service',
    'location',
    'advice',
  ]),
  message: z
    .string()
    .min(10, { message: 'Message must be at least 10 characters' }),
});

type FeedbackSchema = z.infer<typeof schema>;

export async function loader({ request, params }: LoaderFunctionArgs) {
  const garden = await prisma.garden.findUnique({
    where: {
      id: params.id,
    },
  });

  return json({ garden });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { errors, data } = await getValidatedFormData<FeedbackSchema>(
    request,
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
    },
  });

  return redirectWithSuccess('/services/garden', {
    message: 'Berhasil mengirimkan pesan',
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
  const { garden } = useLoaderData<LoaderData>();

  return (
    <MainLayout>
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
          <Form
            className='flex flex-col gap-4'
            method='post'
            onSubmit={handleSubmit}
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
            <Button size='full' type='submit' text='Kirim Pesan' />
          </Form>
        </div>
      </div>
    </MainLayout>
  );
}
