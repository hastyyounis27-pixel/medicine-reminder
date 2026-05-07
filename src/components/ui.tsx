import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'error' | 'outline' | 'ghost' }
>(({ className, variant = 'primary', ...props }, ref) => {
  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container shadow-md',
    secondary: 'bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container shadow-sm',
    error: 'bg-error text-on-error hover:bg-error-container hover:text-on-error-container',
    outline: 'border-2 border-outline-variant bg-transparent text-on-surface hover:bg-surface-container-high',
    ghost: 'bg-transparent text-primary hover:bg-primary-container/10',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-6 py-4 text-label-lg font-bold transition-all active:scale-95 disabled:opacity-50 min-h-[56px] min-w-[56px]',
        variants[variant],
        className
      )}
      {...props}
    />
  );
});

export const Card = ({ children, className, onClick, ...props }: { children: React.ReactNode; className?: string; onClick?: () => void } & React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    {...props}
    onClick={onClick}
    className={cn(
      'bg-surface-container-lowest rounded-2xl p-5 shadow-[0_4px_12px_0_rgba(0,61,155,0.08)] border border-surface-container transition-all',
      onClick && 'active:scale-[0.98] cursor-pointer hover:bg-surface-container-low',
      className
    )}
  >
    {children}
  </div>
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full h-16 px-6 rounded-2xl border-2 border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-0 text-body-lg transition-all',
      className
    )}
    {...props}
  />
));
