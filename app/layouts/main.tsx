import React from 'react';
import Header from './header';
import { User } from '@prisma/client';
import Footer from './footer';

type Props = {
  children: React.ReactNode;
};

export const MainLayout = ({ children }: Props) => {
  return (
    <div className='w-full h-full bg-base-100'>
      <Header />
      {children}
      <Footer />
    </div>
  );
};
