import * as React from "react"
import { cn } from "./button"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'neon' | 'gold' | 'cyan';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide transition-colors",
        {
          'bg-[#00F076] text-black shadow-sm': variant === 'default',
          'bg-gradient-to-r from-[#00F076] to-[#00D06C] text-black': variant === 'neon',
          'bg-[#222228] text-white/90 border border-white/5': variant === 'secondary',
          'border border-white/20 text-white/90': variant === 'outline',
          'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-sm': variant === 'gold',
          'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30': variant === 'cyan',
        },
        className
      )}
      {...props}
    />
  )
}
