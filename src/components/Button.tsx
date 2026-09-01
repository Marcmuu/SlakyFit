import React from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'lg' | 'md' | 'sm'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-brand text-base-950 active:bg-brand-dim',
  secondary: 'bg-base-800 text-base-100 active:bg-base-700 border border-base-700',
  ghost: 'bg-transparent text-base-200 active:bg-base-800',
  danger: 'bg-transparent text-accent-push border border-accent-push/40 active:bg-accent-push/10',
}

const sizeClasses: Record<Size, string> = {
  lg: 'h-14 px-6 text-base rounded-2xl',
  md: 'h-11 px-4 text-sm rounded-xl',
  sm: 'h-9 px-3 text-sm rounded-lg',
}

export default function Button({ variant = 'primary', size = 'md', className = '', ...rest }: ButtonProps) {
  return (
    <button
      className={`font-semibold tracking-tight transition-colors disabled:opacity-40 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    />
  )
}
