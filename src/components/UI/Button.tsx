'use client'

import { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

export function Button({ children, className, variant = 'primary', ...props }: Props) {
  return (
    <button
      {...props}
      className={clsx(
        'px-4 py-2 rounded-xl font-semibold transition duration-200',
        variant === 'primary'
          ? 'bg-lino-acento text-white hover:bg-purple-700'
          : 'bg-lino-fondo-secundario text-lino-texto hover:bg-lino-fondo',
        className
      )}
    >
      {children}
    </button>
  )
}
