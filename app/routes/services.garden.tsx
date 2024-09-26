import type { Garden } from '@prisma/client';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import Banner from '~/components/banner';
import { MainLayout } from '~/layouts/main';
import { prisma } from '~/services/db.server';
import { Information } from './_index';
import { GardenAssociation } from 'types/model';

type LoaderData = {
  data: {
    gardens: GardenAssociation[];
  };
};

export async function loader({ request }: LoaderFunctionArgs) {
  const garden = await prisma.garden.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      photo: true,
    },
  });

  return json<LoaderData>({
    data: {
      gardens: garden.map((garden) => ({
        ...garden,
        photos: garden.photo,
      })),
    },
  });
}

export default function Garden() {
  const loaderData = useLoaderData<LoaderData>();

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
      <Information gardens={loaderData.data.gardens} />
    </MainLayout>
  );
}
