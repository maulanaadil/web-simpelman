import { json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useNavigate } from '@remix-run/react';
import Button from '~/components/button';
import { prisma } from '~/services/db.server';
import { sessionStorage } from '~/services/session.server';

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

  if (userId) {
    await prisma.user.update({
      where: {
        id: parseInt(userId),
      },
      data: {
        isVerified: true,
      },
    });
  }

  return json({
    userId,
  });
}

export default function CheckEmail() {
  const navigate = useNavigate();

  return (
    <div className='h-screen flex flex-col justify-center items-start'>
      <div className='container flex justify-center items-center flex-col gap-5'>
        <div className='flex flex-col justify-center gap-5'>
          <p className='font-bold text-4xl text-base-800'>
            Berhasil terverifikasi
          </p>
          <p className='font-medium text-base-400'>
            Email anda telah berhasil terverifikasi. Silahkan login untuk
            melanjutkan.
          </p>
          <Button
            text='Login'
            onClick={() => navigate({ pathname: '/signin' })}
            size='full'
          />
        </div>
      </div>
    </div>
  );
}
