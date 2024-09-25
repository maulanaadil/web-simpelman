import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node';
import { Form, useNavigate } from '@remix-run/react';
import { BackSquare } from 'iconsax-react';
import Button from '~/components/button';
import { prisma } from '~/services/db.server';
import { sessionStorage } from '~/services/session.server';
import { sendEmail } from '~/utils/mailer';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie')
  );

  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    session.flash('toast', {
      type: 'error',
      message: 'Tidak ada user id yang ditemukan',
    });

    return redirect('/signup', {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    });
  }

  return json({
    userId,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie')
  );

  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    session.flash('toast', {
      type: 'error',
      message: 'Tidak ada user id yang ditemukan',
    });
    return json(
      {
        userId: undefined,
        errors: {
          userId: 'Tidak ada user id yang ditemukan',
        },
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

  await sendEmail({
    name: user?.name,
    to: user?.email,
    link: `${process.env.REMIX_APP_URL}/verify-email?userId=${userId}`,
    type: 'verify',
  });

  session.flash('toast', {
    type: 'success',
    message: 'Email verifikasi telah dikirim ulang',
  });

  return json(
    {
      userId,
    },
    {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    }
  );
}

export default function CheckEmail() {
  const navigate = useNavigate();
  return (
    <div className='h-screen flex flex-col justify-center items-start'>
      <div className='container flex justify-center items-center flex-col gap-5'>
        <div className='flex flex-col justify-center gap-4'>
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
          <p className='font-bold text-4xl text-base-800'>Cek Email Anda</p>
          <p className='font-medium text-base-400'>
            Kami telah mengirimkan email verifikasi ke email anda. Silahkan cek
            email anda dan verifikasi email anda.
          </p>
          <Form method='post'>
            <Button text='Kirim ulang email' type='submit' size='full' />
          </Form>
        </div>
      </div>
    </div>
  );
}
