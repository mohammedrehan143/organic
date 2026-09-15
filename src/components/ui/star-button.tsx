'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'gold';
  icon?: boolean;
}

export function StarButton({
  children,
  className = '',
  variant = 'primary',
  icon = true,
  onClick,
  ...props
}: StarButtonProps) {
  const [clicked, setClicked] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setClicked(true);
    setTimeout(() => setClicked(false), 600);
    if (onClick) onClick(e);
  };

  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl px-5 py-3 text-sm gap-2 select-none shadow-warm-sm';

  const variants = {
    primary:
      'bg-banhmi-red hover:bg-banhmi-redDark text-cream-50 hover:shadow-warm-md hover:-translate-y-0.5',
    outline:
      'border-2 border-banhmi-red text-banhmi-red hover:bg-banhmi-red/10',
    gold:
      'bg-banhmi-gold hover:bg-[#c39162] text-espresso-950 font-semibold hover:shadow-warm-md',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${clicked ? 'scale-95' : ''} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {icon && (
        <Star
          className={`w-4 h-4 transition-transform duration-300 ${
            clicked ? 'rotate-45 scale-125 fill-current' : 'fill-none'
          }`}
        />
      )}
      <span>{children}</span>
    </button>
  );
}
