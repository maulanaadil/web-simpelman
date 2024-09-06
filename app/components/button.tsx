import { cn } from '~/utils/common/styles';

export type ButtonProps = {
  variant?: 'outline' | 'primary';
  size?: 'small' | 'medium' | 'large' | 'full';
  text: string;
  icon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  className?: string;
  iconPosition?: 'left' | 'right';
};

export default function Button({
  text,
  variant = 'primary',
  size = 'medium',
  icon,
  onClick,
  className,
  iconPosition = 'left',
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
        'py-3 rounded-xl font-medium transition-all',
        icon &&
          `flex items-center justify-center gap-2 ${
            iconPosition === 'left' ? 'flex-row' : 'flex-row-reverse'
          }`,
        buttonVariant[variant],
        buttonSize[size],
        className
      )}
      onClick={onClick}
    >
      {icon && icon}
      {text}
    </button>
  );
}
