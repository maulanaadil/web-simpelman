import type { Garden, User } from '@prisma/client';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import React from 'react';
import Banner from '~/components/banner';
import { MainLayout } from '~/layouts/main';
import { sessionStorage } from '~/services/session.server';
import { Information } from './_index';
import { prisma } from '~/services/db.server';

type LoaderData = {
  user: Pick<User, 'email' | 'name'>;
  garden: Omit<Garden, 'createdAt' | 'updatedAt'>[];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieString = request.headers.get('Cookie');

  const user = (await sessionStorage.parse(cookieString)) as LoaderData['user'];

  const garden = await prisma.garden.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return json<LoaderData>({ user, garden });
}

export default function Garden() {
  const { user, garden } = useLoaderData<LoaderData>();

  return (
    <MainLayout user={user}>
      <Banner
        title='Pertamanan'
        subtitle='Layanan Informasi Pertamanan dan Saran '
        breadcrumbs={[
          { label: 'Layanan', href: '/services' },
          { label: 'Pertamanan', href: '/services/garden' },
        ]}
      />
      <Information garden={garden} />
    </MainLayout>
  );
}
