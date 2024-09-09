import React from 'react';
import Header from './header';
import { User } from '@prisma/client';
import Footer from './footer';

type Props = {
  user: Pick<User, 'name' | 'email'>;
  children: React.ReactNode;
};

export const MainLayout = ({ user, children }: Props) => {
  return (
    <div className='w-full h-full bg-base-100'>
      <Header user={user} />
      {children}
      <Footer />
    </div>
  );
};
