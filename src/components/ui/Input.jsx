import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export const Input = forwardRef(({ label, error, className, ...props }, ref) => (
  <div className="space-y-1">
    {label && <label className="label">{label}</label>}
    <input ref={ref} className={cn('input', error && 'border-red-400 focus:ring-red-400', className)} {...props} />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
))

export const Select = forwardRef(({ label, error, children, className, ...props }, ref) => (
  <div className="space-y-1">
    {label && <label className="label">{label}</label>}
    <select ref={ref} className={cn('input', error && 'border-red-400', className)} {...props}>
      {children}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
))

export const Textarea = forwardRef(({ label, error, className, ...props }, ref) => (
  <div className="space-y-1">
    {label && <label className="label">{label}</label>}
    <textarea ref={ref} rows={4} className={cn('input resize-none', error && 'border-red-400', className)} {...props} />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
))
