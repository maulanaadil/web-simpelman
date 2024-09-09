import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from './ui/breadcrumb';

export type BannerProps = {
  title: string;
  subtitle: string | React.ReactNode;
  breadcrumbs: {
    href: string;
    label: string;
  }[];
};

export default function Banner({ title, subtitle, breadcrumbs }: BannerProps) {
  return (
    <div className='w-full bg-primary-500 py-10'>
      <div className='container mx-auto flex flex-col gap-3'>
        <Breadcrumb className='flex gap-2'>
          {breadcrumbs.map((breadcrumb, index) => (
            <BreadcrumbList className='text-base-50 w-fit' key={index}>
              <BreadcrumbItem>
                <BreadcrumbLink
                  className='hover:text-primary-900'
                  href={breadcrumb.href}
                >
                  {breadcrumb.label}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </BreadcrumbList>
          ))}
        </Breadcrumb>
        <p className='text-3xl text-base-50 font-bold'>{title}</p>
        <div className='text-base-50'>{subtitle}</div>
      </div>
    </div>
  );
}
