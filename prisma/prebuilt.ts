import { Garden, Graveyard } from '@prisma/client';

type Photos = {
  imageUrl: string;
}[];

type GardenPrebuilt = Omit<Garden, 'id' | 'createdAt' | 'updatedAt'> & {
  photos: Photos;
};

type GraveyardPrebuilt = Omit<Graveyard, 'id' | 'createdAt' | 'updatedAt'> & {
  photos: Photos;
};

export const garden: GardenPrebuilt[] = [
  {
    name: 'Alun alun Baleendah',
    address:
      'Jl. Anggadireja No.37, Baleendah, Kec. Baleendah, Kabupaten Bandung, Jawa Barat 40375',
    type: 'square',
    photos: [
      {
        imageUrl: '/images/garden/baleendah.jpg',
      },
    ],
  },
  {
    name: 'Alun alun Ciparay',
    address:
      'Jl. Raya Laswi, Pakutandang, Kec. Ciparay, Kabupaten Bandung, Jawa Barat 40381',
    type: 'square',
    photos: [
      {
        imageUrl: '/images/garden/ciparay.jpg',
      },
    ],
  },
  {
    name: 'Alun alun Soreang',
    address:
      'Jl. Raya Soreang-Ciwidey No.126, Soreang, Kec. Soreang, Kabupaten Bandung, Jawa Barat 40911',
    type: 'square',
    photos: [
      {
        imageUrl: '/images/garden/soreang.jpg',
      },
    ],
  },
  {
    name: 'Taman Anak',
    address:
      'Jl. Raya Soreang-Ciwidey No.126, Soreang, Kec. Soreang, Kabupaten Bandung, Jawa Barat 40911',
    type: 'pemda',
    photos: [
      {
        imageUrl: '/images/garden/taman-anak.jpg',
      },
    ],
  },
  {
    name: 'Taman Perpusatakaan',
    address:
      'Jl. Raya Soreang-Ciwidey No.126, Soreang, Kec. Soreang, Kabupaten Bandung, Jawa Barat 40911',
    type: 'pemda',
    photos: [
      {
        imageUrl: '/images/garden/taman-perpustakaan.jpg',
      },
    ],
  },
  {
    name: 'Taman Uncal',
    address:
      'Jl. Raya Soreang-Ciwidey No.126, Soreang, Kec. Soreang, Kabupaten Bandung, Jawa Barat 40911',
    type: 'pemda',
    photos: [
      {
        imageUrl: '/images/garden/taman-uncal.jpg',
      },
    ],
  },
  {
    name: 'Taman Buah',
    address:
      'Jl. Raya Soreang-Ciwidey No.126, Soreang, Kec. Soreang, Kabupaten Bandung, Jawa Barat 40911',
    type: 'pemda',
    photos: [
      {
        imageUrl: '/images/garden/taman-buah.jpg',
      },
    ],
  },
];

export const graveyard: GraveyardPrebuilt[] = [
  {
    name: 'TPU Nagreg',
    mapsUrl: 'https://maps.app.goo.gl/pbwPSb9h9hK9S6uM7',
    address:
      'Jl. Raya Soreang-Ciwidey No.126, Sor eang, Kec. Soreang, Kabupaten Bandung, Jawa Barat 40911',
    photos: [{ imageUrl: '/images/graveyard/tpu-eige.jpg' }],
    numberOfGrave: 100,
    religion: 'muslim',
    type: 'biasa',
    additionalInfo: {},
  },
  {
    name: 'TPU arjasari',
    mapsUrl: 'https://maps.app.goo.gl/giPBA9BCiguAkSHr8',
    address:
      'Jl. Raya Soreang-Ciwidey No.126, Sor eang, Kec. Soreang, Kabupaten Bandung, Jawa Barat 40911',
    photos: [{ imageUrl: '/images/graveyard/tpu-arjasari.jpg' }],
    numberOfGrave: 100,
    religion: 'muslim',
    type: 'biasa',
    additionalInfo: {},
  },
  {
    name: 'TPU Cikoneng',
    mapsUrl: 'https://maps.app.goo.gl/nAmV3k6d3bzn3rvo8',
    address:
      'Jl. Raya Soreang-Ciwidey No.126, Sor eang, Kec. Soreang, Kabupaten Bandung, Jawa Barat 40911',
    photos: [{ imageUrl: '/images/graveyard/tpu-cikoneng.jpg' }],
    numberOfGrave: 100,
    religion: 'muslim',
    type: 'biasa',
    additionalInfo: {},
  },
  {
    name: 'TPU Tegalluar',
    mapsUrl: 'https://maps.app.goo.gl/FhAboPFvn2YB3VKj7',
    address:
      'Jl. Raya Soreang-Ciwidey No.126, Sor eang, Kec. Soreang, Kabupaten Bandung, Jawa Barat 40911',
    photos: [{ imageUrl: '/images/graveyard/tpu-tegalluar.jpg' }],
    numberOfGrave: 100,
    religion: 'muslim',
    type: 'biasa',
    additionalInfo: {},
  },
  {
    name: 'TPU Daraulin',
    mapsUrl: 'https://maps.app.goo.gl/TXf2ztfZVTpbrK3o9',
    address:
      'Jl. Raya Soreang-Ciwidey No.126, Sor eang, Kec. Soreang, Kabupaten Bandung, Jawa Barat 40911',
    photos: [{ imageUrl: '/images/graveyard/tpu-daraulin.jpg' }],
    numberOfGrave: 100,
    religion: 'muslim',
    type: 'biasa',
    additionalInfo: {},
  },
  {
    name: 'TPU Pananjung',
    mapsUrl: 'https://maps.app.goo.gl/8hQhfMGVqmgQxYzj7',
    address:
      'Jl. Raya Soreang-Ciwidey No.126, Sor eang, Kec. Soreang, Kabupaten Bandung, Jawa Barat 40911',
    photos: [{ imageUrl: '/images/graveyard/tpu-pananjung.jpg' }],
    numberOfGrave: 100,
    religion: 'muslim',
    type: 'biasa',
    additionalInfo: {},
  },
  {
    name: 'TPU Baruteok',
    mapsUrl: 'https://maps.app.goo.gl/eMwYRjC5kr3urAXA9',
    address:
      'Jl. Raya Soreang-Ciwidey No.126, Sor eang, Kec. Soreang, Kabupaten Bandung, Jawa Barat 40911',
    photos: [
      {
        imageUrl: '/images/graveyard/tpu-baruteok.jpg',
      },
    ],
    numberOfGrave: 100,
    religion: 'muslim',
    type: 'biasa',
    additionalInfo: {},
  },
  {
    name: 'TPU Haminteu',
    mapsUrl: 'https://maps.app.goo.gl/W3JMETAabvjA2D4r9',
    address:
      'Jl. Raya Soreang-Ciwidey No.126, Sor eang, Kec. Soreang, Kabupaten Bandung, Jawa Barat 40911',
    photos: [{ imageUrl: '/images/graveyard/tpu-haminteu.jpg' }],
    numberOfGrave: 100,
    religion: 'muslim',
    type: 'biasa',
    additionalInfo: {},
  },
];
