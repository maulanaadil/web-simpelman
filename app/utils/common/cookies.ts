import { User } from '@prisma/client';
import { sessionStorage } from '~/services/session.server';

export async function getCookie({ request }: { request: Request }) {
  const cookieString = request.headers.get('Cookie');

  const user = (await sessionStorage.parse(cookieString)) as Pick<
    User,
    'id' | 'email' | 'password' | 'role'
  >;

  return user;
}
