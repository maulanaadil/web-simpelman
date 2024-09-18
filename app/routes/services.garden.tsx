import type { Garden, User } from '@prisma/client';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import React from 'react';
import Banner from '~/components/banner';
import { MainLayout } from '~/layouts/main';
import { sessionStorage } from '~/services/session.server';
import { Information } from './_index';
import { prisma } from '~/services/db.server';
import { getCookie } from '~/utils/common/cookies';

type LoaderData = {
  garden: Omit<Garden, 'createdAt' | 'updatedAt'>[];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCookie({ request });
  const garden = await prisma.garden.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return json({ garden });
}

export default function Garden() {
  const { garden } = useLoaderData<LoaderData>();

  return (
    <MainLayout>
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
