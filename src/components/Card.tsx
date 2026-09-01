import React from 'react'

export default function Card({ className = '', children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`bg-base-900 border border-base-800 rounded-2xl p-4 ${className}`} {...rest}>
      {children}
    </div>
  )
}
