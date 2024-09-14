import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@prisma/client';
import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/node';
import { Form, Link, useNavigate } from '@remix-run/react';
import { BackSquare } from 'iconsax-react';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { redirectWithInfo, redirectWithSuccess } from 'remix-toast';
import { z } from 'zod';
import Button from '~/components/button';
import InputPassword from '~/components/input-password';
import InputText from '~/components/input-text';
import { prisma } from '~/services/db.server';
import { sessionStorage } from '~/services/session.server';

const schema = z.object({
  email: z.string().email('Must be a valid email'),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
});

type SignInSchema = z.infer<typeof schema>;

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieString = request.headers.get('Cookie');

  const user = (await sessionStorage.parse(cookieString)) as Pick<
    User,
    'email' | 'name'
  >;

  if (user) {
    return redirectWithInfo('/', {
      message: 'Anda sudah masuk, tidak perlu masuk lagi',
    });
  }

  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const {
    errors,
    data,
    receivedValues: defaultValues,
  } = await getValidatedFormData<SignInSchema>(request, zodResolver(schema));

  if (errors) {
    return json(
      {
        email: undefined,
        password: undefined,
        errors,
      },
      { status: 400 }
    );
  }

  const user = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
    select: {
      name: true,
      email: true,
    },
  });

  if (!user) {
    return json(
      {
        email: undefined,
        password: undefined,
        errors: {
          email: {
            message: 'Email tidak ditemukan',
          },
        },
      },
      { status: 400 }
    );
  }

  return redirectWithSuccess(
    '/',
    {
      message: 'Sign in success',
    },
    {
      headers: {
        'Set-Cookie': await sessionStorage.serialize(user),
      },
    }
  );
}

export default function Signin() {
  const navigate = useNavigate();
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useRemixForm<SignInSchema>({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
  });

  return (
    <div className='px-[7.5rem] py-[5rem] flex flex-col gap-5'>
      <button
        className='flex items-center gap-2.5'
        onClick={() =>
          navigate({
            pathname: '/',
          })
        }
      >
        <BackSquare color='#0f9650' size={20} />
        <p className='text-primary-500 font-medium'>Kembali</p>
      </button>
      <div className='flex flex-col gap-10 mt-10'>
        <div className='flex flex-col gap-3'>
          <p className='font-bold text-4xl text-base-800'>Masuk</p>
          <p className='font-medium text-base-400'>
            Akses layanan kami dengan masuk ke akun Anda.
          </p>
        </div>
        <Form
          className='flex flex-col gap-4'
          method='post'
          onSubmit={handleSubmit}
        >
          <InputText
            label='Email'
            isHookForm
            control={control}
            type='email'
            placeholder='Masukan email'
            controlName='email'
            error={errors?.email?.message}
          />
          <InputPassword
            label='Password'
            isHookForm
            control={control}
            placeholder='Masukan password'
            controlName='password'
            error={errors?.password?.message}
          />
          <Link
            className='text-base-700 font-semibold text-end'
            to={'/forgot-password'}
          >
            Lupa Password
          </Link>
          <Button size='full' type='submit' text='Masuk' />
        </Form>
      </div>
    </div>
  );
}
