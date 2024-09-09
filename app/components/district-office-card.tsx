import { cn } from '~/utils/common/styles';

type Props = {
  className?: string;
};

export default function DistrictOfficeCard({ className }: Props) {
  return (
    <div
      className={cn(
        'p-3 rounded-xl bg-base-50 flex items-center gap-3 w-fit',
        className
      )}
    >
      <div>
        <img
          className='w-[5.9rem] h-[3.5rem] object-cover'
          src='/images/disperkimtan-logo.jpeg'
          alt='disctric-logo'
        />
      </div>
      <div className='flex flex-col gap-2'>
        <p className='text-sm font-semibold text-base-800'>Kabupaten Bandung</p>
        <p className='text-xs text-base-400'>Dinas Pemukiman dan Pertamanan</p>
      </div>
    </div>
  );
}
