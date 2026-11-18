import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'neon' | 'glass';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 active:scale-95",
          {
            'bg-[#FECF59] text-black hover:bg-[#FDBF3B] shadow-[0_0_20px_rgba(254,207,89,0.35)]':
              variant === 'default',
            'bg-gradient-to-r from-[#FECF59] via-amber-400 to-yellow-500 text-black hover:shadow-[0_0_25px_rgba(254,207,89,0.5)] font-black':
              variant === 'neon',
            'border border-white/15 bg-transparent text-white hover:bg-white/10':
              variant === 'outline',
            'bg-[#222228] text-white hover:bg-[#2C2C34]':
              variant === 'secondary',
            'hover:bg-white/10 text-white':
              variant === 'ghost',
            'bg-black/50 backdrop-blur-md border border-white/15 text-white hover:bg-black/70':
              variant === 'glass',
            'h-10 px-5 py-2': size === 'default',
            'h-8 px-3 text-xs': size === 'sm',
            'h-12 px-8 text-base': size === 'lg',
            'h-10 w-10 p-0': size === 'icon',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
