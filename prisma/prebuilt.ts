import { Garden } from '@prisma/client';

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
