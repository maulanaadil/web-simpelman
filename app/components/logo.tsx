import React from 'react';
import LogoIcon from '~/assets/icons/logo';
import { cn } from '~/utils/common/styles';

type Props = {
  className?: string;
  isLogoWhite?: boolean;
} & React.HTMLProps<HTMLDivElement>;

export default function Logo({ className, isLogoWhite, ...props }: Props) {
  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      <LogoIcon width={56} height={52} isWhite={isLogoWhite} />
      <p className='font-semibold text-base-900 text-2xl uppercase'>
        SIMPELMAN
      </p>
    </div>
  );
}
