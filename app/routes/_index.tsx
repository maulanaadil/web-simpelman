import { Garden } from "@prisma/client";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, useLoaderData, useNavigate } from "@remix-run/react";
import { ArrowRight2 } from "iconsax-react";
import { GardenAssociation } from "types/model";
import LogoIcon from "~/assets/icons/logo";
import Button from "~/components/button";
import DistrictOfficeCard from "~/components/district-office-card";
import { sevices } from "~/constants/services";
import { MainLayout } from "~/layouts/main";
import { prisma } from "~/services/db.server";

type LoaderData = {
  data: {
    gardens: GardenAssociation[];
  };
};

export const meta: MetaFunction = () => {
  return [
    { title: "SIMPELMAN" },
    {
      name: "description",
      content: "Sistem Informasi Pelayanan Pertamanan dan Pemakaman!",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const gardens = await prisma.garden.findMany({
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      photo: true,
    },
  });

  return json<LoaderData>({
    data: {
      gardens: gardens.map((garden) => ({
        ...garden,
        photos: garden.photo,
      })),
    },
  });
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <MainLayout>
      <Hero />
      <Services />
      <Information gardens={loaderData.data.gardens} />
    </MainLayout>
  );
}

function Hero() {
  const navigate = useNavigate();
  return (
    <div className="relative z-50 w-full h-[47.5rem] overflow-hidden">
      <div className="w-full h-full absolute z-20 bg-gradient-to-r from-primary-500 from-60% "></div>
      <div className="absolute w-full h-full z-10 inset-0">
        <img
          src="/images/bg-hero.png"
          className="object-cover w-full h-full"
          alt="graveyard"
        />
      </div>
      <div className="ml-20 py-[7.5rem] absolute z-30 flex flex-col justify-between gap-20">
        <div className="flex flex-col gap-6">
          <DistrictOfficeCard />
          <p className="text-[3.5rem] text-base-50 font-bold leading-tight">
            Sistem Pemakaman <br /> dan Pertamanan
          </p>
          <p className="text-lg text-base-50 font-medium">
            Hadir Untuk Menjawab Kebutuhan Masyarakat yang Ingin Mendapatkan
            Pelayanan <br /> dengan Nyaman
          </p>
        </div>
        <div className="flex items-center gap-4 ">
          <Button
            onClick={() =>
              navigate({
                pathname: "/services",
              })
            }
            text="Pilih layanan"
            className="bg-base-50 text-base-900 hover:bg-base-300 disabled:bg-base-50"
          />
          <Button
            text="Tentang"
            variant="outline"
            onClick={() =>
              navigate({
                pathname: "/about",
              })
            }
            className="bg-transparent border border-base-50 text-base-50 hover:border-base-300 hover:text-base-300 disabled:border-base-300 disabled:text-base-300"
          />
        </div>
      </div>
      <LogoIcon
        width={593}
        isWhite
        height={545}
        className="absolute z-30 top-20 -right-40"
      />
    </div>
  );
}

export function Services() {
  const navigate = useNavigate();

  return (
    <div className="container py-[3.5rem]">
      <div className="flex flex-col gap-3 justify-center items-center">
        <p className="text-primary-500 text-center font-semibold text-2xl">
          Layanan
        </p>
        <div className="flex flex-col gap-4 justify-center items-center">
          <p className="text-3xl text-center font-semibold text-base-900">
            {" "}
            Jenis Layanan yang Disediakan
          </p>
        </div>
      </div>
      <div className="mt-16 flex gap-4 items-center justify-center">
        {sevices.map((service) => (
          <div
            key={service.title}
            className="p-5 group rounded-xl border border-base-300 hover:bg-primary-500 bg-base-50 flex items-center gap-10 transition-all group-hover:transition-all"
          >
            <div className="w-56 h-44 overflow-clip rounded-lg">
              <img
                src={service.image}
                alt="tpu"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-between gap-10">
              <div className="flex flex-col gap-1">
                <p className="text-2xl font-semibold text-neutral-800 group-hover:text-base-50">
                  {service.title}
                </p>
                <p className="text-neutral-400 group-hover:text-base-50">
                  {service.description}
                </p>
              </div>
              <Button
                text="Selengkapnya"
                className="group-hover:bg-base-50 group-hover:text-primary-500"
                onClick={() => navigate({ pathname: service.route })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Information({ gardens }: { gardens: GardenAssociation[] }) {
  const navigate = useNavigate();
  return (
    <div className="container py-[3.5rem]">
      <div className="flex flex-col gap-3 justify-center items-center">
        <p className="text-primary-500 text-center font-semibold text-2xl">
          Informasi
        </p>
        <div className="flex flex-col gap-4 justify-center items-center">
          <p className="text-3xl text-center font-semibold text-base-900">
            {" "}
            Pertamanan Daerah Kabupaten Bandung
          </p>
          <p className="text-lg text-base-400 text-center">
            {" "}
            Berita yang ada di Dinas Cipta Karya, Bina Konstruksi dan Tata Ruang
            Kabupaten Bandung
          </p>
        </div>
      </div>
      <div className="mt-16 grid grid-cols-3 gap-6">
        {gardens.map((item) => (
          <div
            key={item.id}
            onClick={() =>
              navigate({ pathname: `/services/garden/${item.id}` })
            }
            className="rounded-lg bg-white hover:shadow-sm transition-all overflow-clip cursor-pointer hover:opacity-80 "
          >
            <div className="w-full h-[14.5rem]">
              <img
                className="object-cover w-full h-full"
                src={item.photos[0].imageUrl}
                alt="graveyard-article"
                loading="lazy"
              />
            </div>
            <div className="p-6 bg-base-50 flex flex-col gap-2">
              <p className="text-2xl font-semibold text-base-900">
                {item.name}
              </p>
              <p className="text-neutral-600 text-sm line-clamp-3 font-light">
                {item.address}
              </p>
              <div className="flex items-center  gap-1 mt-4">
                <p className="text-primary-500 text-medium ">
                  Lihat selengkapnya
                </p>
                <ArrowRight2 color="#0f9650" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
