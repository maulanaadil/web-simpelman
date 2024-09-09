import { ActionFunctionArgs } from '@remix-run/node';
import { redirectWithSuccess } from 'remix-toast';
import { sessionStorage } from '~/services/session.server';

export async function action({ request }: ActionFunctionArgs) {
  return redirectWithSuccess(
    '/',
    {
      message: 'Logout berhasil',
    },
    {
      headers: {
        'Set-Cookie': await sessionStorage.serialize('', {
          maxAge: 0,
        }),
      },
    }
  );
}
