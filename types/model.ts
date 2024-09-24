import { Garden } from '@prisma/client';

export type Feedback = {
  id: number;
  email: string;
  content: string;
  about: 'infrastructural_facilities' | 'service' | 'location' | 'advice';
  createdAt: Date;
  updatedAt: Date;
  garden?: Garden;
};
