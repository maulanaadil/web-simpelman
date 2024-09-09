import { User } from '@prisma/client';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { MainLayout } from '~/layouts/main';
import { sessionStorage } from '~/services/session.server';
import { Services } from './_index';

type LoaderData = {
  user: Pick<User, 'email' | 'name'>;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieString = request.headers.get('Cookie');

  const user = (await sessionStorage.parse(cookieString)) as LoaderData['user'];

  return json<LoaderData>({ user });
}

export default function Service() {
  const { user } = useLoaderData<LoaderData>();
  return (
    <MainLayout user={user}>
      <Services />
    </MainLayout>
  );
}
