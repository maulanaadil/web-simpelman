import { ActionFunctionArgs } from '@remix-run/node';
import { redirectWithSuccess } from 'remix-toast';
import { sessionStorage } from '~/services/session.server';

export async function action({ request }: ActionFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie')
  );
  return redirectWithSuccess(
    '/',
    {
      message: 'Logout berhasil',
    },
    {
      headers: {
        'Set-Cookie': await sessionStorage.destroySession(session),
      },
    }
  );
}
