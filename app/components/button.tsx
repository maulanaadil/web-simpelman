import { cn } from '~/utils/common/styles';

export type ButtonProps = {
  variant?: 'outline' | 'primary';
  size?: 'small' | 'medium' | 'large' | 'full';
  text: string;
  icon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  className?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  text,
  variant = 'primary',
  size = 'medium',
  icon,
  onClick,
  className,
  loading,
  iconPosition = 'left',
  ...props
}: ButtonProps) {
  const buttonVariant = {
    primary:
      'bg-primary-500 text-base-50 hover:bg-primary-600 disabled:bg-primary-300',
    outline:
      'bg-transparent border border-primary-500 text-primary-500 hover:border-primary-300 hover:text-primary-300 disabled:border-primary-300 disabled:text-primary-300',
  };

  const buttonSize = {
    small: 'px-5',
    medium: 'px-7',
    large: 'px-9',
    full: 'w-full',
  };

  return (
    <button
      className={cn(
        'py-3 rounded-xl font-medium transition-all w-fit',
        icon &&
          `flex items-center justify-center gap-2 ${
            iconPosition === 'left' ? 'flex-row' : 'flex-row-reverse'
          }`,
        buttonVariant[variant],
        buttonSize[size],
        className
      )}
      onClick={onClick}
      disabled={loading}
      {...props}
    >
      {icon && icon}
      {text}
      {loading && (
        <svg
          className='animate-spin h-5 w-5 text-base-100'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
        >
          <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'
          ></circle>
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.001 8.001 0 0120.709 5.709L18.296 8.12a6 6 0 10-1.414 1.414l2.412-2.412z'
          ></path>
        </svg>
      )}
    </button>
  );
}
