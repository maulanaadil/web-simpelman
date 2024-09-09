// app/services/session.server.ts
import { createCookie } from '@remix-run/node';

if (!process.env.SESSION_SECRET) {
  throw new Error(
    'SESSION_SECRET is not set in the environment variables. Please set it before running the app.'
  );
}

// export the whole sessionStorage object
export const sessionStorage = createCookie('auth', {
  httpOnly: true, // for security reasons, make this cookie http only
  path: '/', // remember to add this so the cookie will work in all routes
  sameSite: 'lax', // this helps with CSRF
  secrets: [process.env.SESSION_SECRET], // replace this with an actual secret
  secure: process.env.NODE_ENV === 'production', // enable this in prod only
  maxAge: 60 * 60 * 24 * 7,
});
