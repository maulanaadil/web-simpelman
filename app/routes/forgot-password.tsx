import { zodResolver } from '@hookform/resolvers/zod';
import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/node';
import {
  redirect,
  useFetcher,
  useLoaderData,
  useNavigate,
} from '@remix-run/react';
import bcrypt from 'bcryptjs';
import { BackSquare } from 'iconsax-react';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { z } from 'zod';
import Button from '~/components/button';
import InputPassword from '~/components/input-password';
import InputText from '~/components/input-text';
import { prisma } from '~/services/db.server';
import { sessionStorage } from '~/services/session.server';
import { validatePassword } from '~/utils/common/validate';
import { sendEmail } from '~/utils/mailer';

const STEPS = {
  default: 'default-password',
  confirm: 'confirm-password',
  form: 'form-password',
  changed: 'changed-password',
};

const schema = z.object({
  email: z.string().email('Must be a valid email'),
});

type Schema = z.infer<typeof schema>;

const forgotPasswordSchema = z
  .object({
    password: z.string().min(8).refine(validatePassword, {
      message:
        'Password harus memiliki setidaknya satu huruf besar dan karakter unik',
    }),
    confirmPassword: z.string().min(8).refine(validatePassword, {
      message:
        'Password harus memiliki setidaknya satu huruf besar dan karakter unik',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak sama',
    path: ['password'],
  });

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie')
  );

  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const step = url.searchParams.get('step');

  if (userId && step === 'confirm-password') {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
    });

    return json({
      userId,
      step,
      user,
    });
  }

  if (!userId && step === 'form') {
    session.flash('toast', {
      type: 'error',
      message: 'Tidak ada user id yang ditemukan',
    });

    return redirect(`/forgot-password?step=${STEPS.default}`, {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    });
  }

  return json({
    userId,
    step,
    user: null,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie')
  );

  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const step = url.searchParams.get('step');

  if (step === 'form-password' && userId) {
    const { errors, data } = await getValidatedFormData<ForgotPasswordSchema>(
      request,
      zodResolver(forgotPasswordSchema)
    );

    if (errors) {
      session.flash('toast', {
        type: 'error',
        message: 'Gagal mengirimkan pesan',
      });

      return json(
        {
          password: undefined,
          confirmPassword: undefined,
          errors,
        },
        {
          headers: {
            'Set-Cookie': await sessionStorage.commitSession(session),
          },
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
    });

    if (!user) {
      session.flash('toast', {
        type: 'error',
        message: 'User tidak ditemukan',
      });

      return redirect(`/forgot-password?step=${STEPS.default}`, {
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      });
    }

    const passBool = await bcrypt.compare(data.password, user?.password || '');

    if (passBool) {
      session.flash('toast', {
        type: 'error',
        message: 'Password tidak boleh sama dengan password lama',
      });

      return json(
        {
          password: undefined,
          confirmPassword: undefined,
          errors: {
            password: 'Password tidak boleh sama dengan password lama',
          },
        },
        {
          headers: {
            'Set-Cookie': await sessionStorage.commitSession(session),
          },
        }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 8);

    await prisma.user.update({
      where: {
        id: parseInt(userId),
      },
      data: {
        password: hashedPassword,
      },
    });

    session.flash('toast', {
      type: 'success',
      message: 'Berhasil mengubah password',
    });

    return redirect(`/forgot-password?step=${STEPS.changed}`, {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    });
  }

  const { errors, data } = await getValidatedFormData<Schema>(
    request,
    zodResolver(schema)
  );

  if (errors) {
    session.flash('toast', {
      type: 'error',
      message: 'Gagal mengirimkan pesan',
    });

    return json(
      {
        email: undefined,
        errors,
      },
      {
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      }
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    session.flash('toast', {
      type: 'error',
      message: 'Email tidak ditemukan',
    });

    return json(
      {
        email: undefined,
        errors,
      },
      {
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      }
    );
  }

  await sendEmail({
    name: user?.name,
    to: user?.email,
    link: `${process.env.REMIX_APP_URL}/forgot-password?step=${STEPS.form}&userId=${user.id}`,
    type: 'forgot-password',
  });

  session.flash('toast', {
    type: 'success',
    message: 'Berhasil mengirimkan email',
  });

  return redirect(`/forgot-password?step=${STEPS.confirm}&userId=${user.id}`, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  });
}

export default function ForgotPassword() {
  const loaderData = useLoaderData<typeof loader>();

  if (loaderData.step === 'confirm-password') {
    return <Confirm />;
  }

  if (loaderData.step === 'form-password') {
    return <Form />;
  }

  if (loaderData.step === 'changed-password') {
    return <Success />;
  }

  return <_ForgotPassword />;
}

function Success() {
  const navigate = useNavigate();

  return (
    <div className='h-screen flex flex-col justify-center items-start'>
      <div className='container flex justify-center items-center flex-col gap-5'>
        <div className='flex flex-col justify-center gap-4 w-2/3'>
          <button
            className='flex items-center gap-2.5 w-fit'
            onClick={() =>
              navigate({
                pathname: '/forgot-password',
              })
            }
          >
            <BackSquare color='#0f9650' size={20} />
            <p className='text-primary-500 font-medium'>Kembali</p>
          </button>
          <p className='font-bold text-4xl text-base-800'>
            Password sudah diubah
          </p>
          <p className='font-medium text-sm text-base-400'>
            Terimakasih sudah melakukan verifikasi email anda sudah bisa
            mengakses layanan dari si Tampan dikirim ke email{' '}
          </p>
          <Button
            text='Masuk'
            size='full'
            onClick={() =>
              navigate({
                pathname: '/signin',
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

function Form() {
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useRemixForm<ForgotPasswordSchema>({
    mode: 'onSubmit',
    resolver: zodResolver(forgotPasswordSchema),
  });

  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();
  return (
    <div className='h-screen flex flex-col justify-center items-start'>
      <div className='container flex justify-center items-center flex-col gap-5'>
        <div className='flex flex-col justify-center gap-4 w-2/3'>
          <button
            className='flex items-center gap-2.5 w-fit'
            onClick={() =>
              navigate({
                pathname: '/signin',
              })
            }
          >
            <BackSquare color='#0f9650' size={20} />
            <p className='text-primary-500 font-medium'>Kembali</p>
          </button>
          <p className='font-bold text-4xl text-base-800'>Ubah Password</p>
          <fetcher.Form
            method='post'
            className='flex flex-col gap-4'
            onSubmit={handleSubmit}
          >
            <InputPassword
              label='Password Baru'
              isHookForm
              control={control}
              controlName='password'
              error={errors?.password?.message}
              name='password'
              placeholder='Masukan password baru'
            />
            <InputPassword
              label='Konfirmasi Password Baru'
              isHookForm
              control={control}
              controlName='confirmPassword'
              error={errors?.confirmPassword?.message}
              name='confirmPassword'
              placeholder='Masukan konfimasi password baru'
            />
            <Button text='Masukan password baru' type='submit' size='full' />
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
}

function Confirm() {
  const loaderData = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div className='h-screen flex flex-col justify-center items-start'>
      <div className='container flex justify-center items-center flex-col gap-5'>
        <div className='flex flex-col justify-center gap-4 w-2/3'>
          <button
            className='flex items-center gap-2.5 w-fit'
            onClick={() =>
              navigate({
                pathname: '/forgot-password',
              })
            }
          >
            <BackSquare color='#0f9650' size={20} />
            <p className='text-primary-500 font-medium'>Kembali</p>
          </button>
          <p className='font-bold text-4xl text-base-800'>
            Konfirmasi permintaan reset password
          </p>
          <p className='font-medium text-sm text-base-400'>
            dikirim ke email{' '}
            <span className='text-primary-500'>{loaderData.user?.email}</span>
          </p>
          <Button
            variant='outline'
            text='Tidak ada email, Laporkan'
            onClick={() => window.open('https://wa.me/6288222886364', '_blank')}
            size='full'
          />
        </div>
      </div>
    </div>
  );
}

function _ForgotPassword() {
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useRemixForm<Schema>({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
  });

  const navigate = useNavigate();
  const fetcher = useFetcher<typeof action>();
  return (
    <div className='h-screen flex flex-col justify-center items-start'>
      <div className='container flex justify-center items-center flex-col gap-5'>
        <div className='flex flex-col justify-center gap-4 w-2/3'>
          <button
            className='flex items-center gap-2.5 w-fit'
            onClick={() =>
              navigate({
                pathname: '/signin',
              })
            }
          >
            <BackSquare color='#0f9650' size={20} />
            <p className='text-primary-500 font-medium'>
              Kembali ke halaman login
            </p>
          </button>
          <p className='font-bold text-4xl text-base-800'>Masukan Email Anda</p>
          <p className='font-medium text-sm text-base-400'>
            Kami akan mengirimkan email untuk mereset password
          </p>
          <fetcher.Form
            method='post'
            className='flex flex-col gap-4'
            onSubmit={handleSubmit}
          >
            <InputText
              label='Email'
              isHookForm
              control={control}
              controlName='email'
              error={errors?.email?.message}
              name='email'
              type='email'
              placeholder='Masukan email'
            />
            <Button text='Kirim ulang email' type='submit' size='full' />
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
}
