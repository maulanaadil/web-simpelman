// app/services/session.server.ts
import { User } from '@prisma/client';
import { createCookieSessionStorage } from '@remix-run/node';
import { createToastUtilsWithCustomSession } from 'remix-toast';

export type SessionData = {
  user: Omit<User, 'createdAt' | 'updatedAt'>;
};

type SessionFlashData = {
  error: string;
  toast: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  } | null;
};

if (!process.env.SESSION_SECRET) {
  throw new Error(
    'SESSION_SECRET is not set in the environment variables. Please set it before running the app.'
  );
}

// export the whole sessionStorage object
export const sessionStorage = createCookieSessionStorage<
  SessionData,
  SessionFlashData
>({
  cookie: {
    name: '__session',
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  },
});

export const {
  getToast,
  redirectWithToast,
  redirectWithSuccess,
  redirectWithError,
  redirectWithInfo,
  redirectWithWarning,
  jsonWithSuccess,
  jsonWithError,
  jsonWithInfo,
  jsonWithWarning,
} = createToastUtilsWithCustomSession(sessionStorage);
