import { User } from '@prisma/client';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import Banner from '~/components/banner';
import { MainLayout } from '~/layouts/main';
import { sessionStorage } from '~/services/session.server';

type LoaderData = {
  user: Pick<User, 'email' | 'name'>;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieString = request.headers.get('Cookie');

  const user = (await sessionStorage.parse(cookieString)) as LoaderData['user'];

  return json<LoaderData>({ user });
}

export default function About() {
  const { user } = useLoaderData<LoaderData>();
  return (
    <MainLayout user={user}>
      <Banner
        title='Tentang'
        subtitle='Layanan Informasi Tentang Kami'
        breadcrumbs={[{ label: 'Tentang', href: '/about' }]}
      />
      <div className='h-80'>Unknown</div>
    </MainLayout>
  );
}
