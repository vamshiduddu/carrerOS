import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export default function Button({ variant = 'secondary', size, children, className, ...props }: ButtonProps) {
  const cls = [
    'btn',
    variant === 'primary' ? 'btn-primary' : '',
    variant === 'secondary' ? 'btn-secondary' : '',
    variant === 'ghost' ? 'btn-ghost' : '',
    variant === 'danger' ? 'btn-danger' : '',
    size === 'sm' ? 'btn-sm' : '',
    className ?? '',
  ].filter(Boolean).join(' ');

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
