import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- פלטת צבעים חדשה בהשראת הלוגו ---
const buttonVariants = {
  primary: 'bg-amber-800 text-white hover:bg-amber-900 disabled:bg-amber-700/60',
  destructive: 'bg-red-700 text-white hover:bg-red-800 disabled:bg-red-500',
  outline: 'border border-gray-300 bg-transparent hover:bg-gray-100 disabled:opacity-50',
  ghost: 'bg-transparent hover:bg-gray-100 disabled:opacity-50',
  link: 'text-amber-800 underline-offset-4 hover:underline disabled:opacity-50',
};

const buttonSizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
};

const Button = React.forwardRef(
  ({ className, variant = 'primary', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={twMerge(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 disabled:pointer-events-none',
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };