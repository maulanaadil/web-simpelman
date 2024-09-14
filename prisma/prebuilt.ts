import { Garden, Graveyard } from '@prisma/client';

export const garden: Omit<Garden, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Alun alun Baleendah',
    address:
      'Jl. Anggadireja No.37, Baleendah, Kec. Baleendah, Kabupaten Bandung, Jawa Barat 40375',
    imageUrl: '/images/garden/baleendah.jpg',
    type: 'square',
  },
  {
    name: 'Alun alun Ciparay',
    address:
      'Jl. Raya Laswi, Pakutandang, Kec. Ciparay, Kabupaten Bandung, Jawa Barat 40381',
    imageUrl: '/images/garden/ciparay.jpg',
    type: 'square',
  },
  {
    name: 'Alun alun Soreang',
    address:
      'Jl. Raya Soreang-Ciwidey No.126, Soreang, Kec. Soreang, Kabupaten Bandung, Jawa Barat 40911',
    imageUrl: '/images/garden/soreang.jpg',
    type: 'square',
  },
  {
    name: 'Taman Anak',
    address:
      'Jl. Raya Soreang-Ciwidey No.126, Soreang, Kec. Soreang, Kabupaten Bandung, Jawa Barat 40911',
    imageUrl: '/images/garden/taman-anak.jpg',
    type: 'pemda',
  },
  {
    name: 'Taman Perpusatakaan',
    address:
      'Jl. Raya Soreang-Ciwidey No.126, Soreang, Kec. Soreang, Kabupaten Bandung, Jawa Barat 40911',
    imageUrl: '/images/garden/taman-perpustakaan.jpg',
    type: 'pemda',
  },
  {
    name: 'Taman Uncal',
    address:
      'Jl. Raya Soreang-Ciwidey No.126, Soreang, Kec. Soreang, Kabupaten Bandung, Jawa Barat 40911',
    imageUrl: '/images/garden/taman-uncal.jpg',
    type: 'pemda',
  },
  {
    name: 'Taman Buah',
    address:
      'Jl. Raya Soreang-Ciwidey No.126, Soreang, Kec. Soreang, Kabupaten Bandung, Jawa Barat 40911',
    imageUrl: '/images/garden/taman-buah.jpg',
    type: 'pemda',
  },
];

export const graveyard: Omit<Graveyard, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'TPU Nagreg',
    mapsUrl: 'https://maps.app.goo.gl/pbwPSb9h9hK9S6uM7',
    address:
      'Jl. Raya Soreang-Ciwidey No.126, Sor eang, Kec. Soreang, Kabupaten Bandung, Jawa Barat 40911',
    imageUrl: '/images/graveyard/tpu-eige.jpg',
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
    imageUrl: '/images/graveyard/tpu-arjasari.jpg',
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
    imageUrl: '/images/graveyard/tpu-cikoneng.jpg',
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
    imageUrl: '/images/graveyard/tpu-tegalluar.jpg',
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
    imageUrl: '/images/graveyard/tpu-daraulin.jpg',
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
    imageUrl: '/images/graveyard/tpu-pananjung.jpg',
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
    imageUrl: '/images/graveyard/tpu-baruteok.jpg',
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
    imageUrl: '/images/graveyard/tpu-haminteu.jpg',
    numberOfGrave: 100,
    religion: 'muslim',
    type: 'biasa',
    additionalInfo: {},
  },
];
