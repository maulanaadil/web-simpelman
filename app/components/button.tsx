import { cn } from '~/utils/common/styles';
import Loader from './loader';

export type ButtonProps = {
  variant?: 'outline' | 'primary';
  size?: 'small' | 'medium' | 'large' | 'full';
  text: string | React.ReactNode;
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
    small: 'px-3 py-2 text-sm',
    medium: 'px-7',
    large: 'px-9',
    full: 'w-full',
  };

  return (
    <button
      className={cn(
        'py-3 rounded-xl font-medium transition-all w-fit',
        loading && 'flex items-center justify-center gap-4',
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
      {loading && <Loader />}
    </button>
  );
}
