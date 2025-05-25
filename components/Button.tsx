
import React, { ReactNode } from 'react';

interface ButtonProps {
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  children: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  children,
}) => {
  const baseStyles = "font-semibold rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark-bg dark:focus:ring-offset-slate-800";
  
  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles = 'bg-brand-primary hover:bg-brand-primary-hover text-white focus:ring-brand-primary';
      break;
    case 'secondary':
      variantStyles = 'bg-brand-dark-card hover:bg-brand-dark-border text-brand-text-light border border-brand-dark-border focus:ring-brand-primary dark:bg-slate-700 dark:hover:bg-slate-600 dark:border-slate-600 dark:text-gray-200';
      break;
    case 'danger':
      variantStyles = 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500';
      break;
    case 'ghost':
      variantStyles = 'bg-transparent hover:bg-brand-dark-card text-brand-primary dark:hover:bg-slate-700 focus:ring-brand-primary';
      break;
  }

  let sizeStyles = '';
  switch (size) {
    case 'sm':
      sizeStyles = 'px-3 py-1.5 text-sm';
      break;
    case 'md':
      sizeStyles = 'px-4 py-2 text-base';
      break;
    case 'lg':
      sizeStyles = 'px-6 py-3 text-lg';
      break;
  }

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${disabledStyles} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
    