import {
  Garden as _Garden,
  Photo as _Photo,
  Graveyard as _Graveyard,
} from '@prisma/client';

export type Feedback = {
  id: number;
  email: string;
  content: string;
  about: 'infrastructural_facilities' | 'service' | 'location' | 'advice';
  createdAt: Date;
  updatedAt: Date;
  garden?: Garden;
};

type Garden = Omit<_Garden, 'createdAt' | 'updatedAt'>;
type Graveyard = Omit<_Graveyard, 'createdAt' | 'updatedAt'>;
type Photo = Omit<_Photo, 'createdAt' | 'updatedAt'>;

export type GardenAssociation = Garden & {
  photos: Photo[];
};

export type GraveyardAssociation = Graveyard & {
  photos: Photo[];
};
