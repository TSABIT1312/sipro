import { cn } from '@/utils/cn'

function initials(name) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

export function Avatar({ name, src, size = 'md', className }) {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-20 h-20 text-xl',
  }

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover shrink-0', sizes[size], className)}
      />
    )
  }

  return (
    <div className={cn(
      'rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white font-semibold flex items-center justify-center shrink-0',
      sizes[size],
      className
    )}>
      {initials(name)}
    </div>
  )
}
