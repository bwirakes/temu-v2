'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

// Define calendar props without extending HTMLAttributes
interface CalendarProps {
  className?: string
  mode?: 'single' | 'range' | 'multiple'
  selected?: Date | Date[] | { from: Date; to: Date }
  onSelect?: (date: Date | undefined) => void
  disabled?: { from: Date; to: Date } | ((date: Date) => boolean)
  initialFocus?: boolean
}

// Extremely simplified placeholder component that just renders the calendar UI
export function Calendar({
  className,
  mode = 'single',
  selected,
  onSelect,
  disabled,
  initialFocus,
}: CalendarProps) {
  const today = new Date()
  
  // Format date as YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }
  
  // Get month name
  const getMonthName = (month: number) => {
    return new Date(2000, month, 1).toLocaleString('id-ID', { month: 'long' })
  }
  
  return (
    <div className={cn('p-3', className)}>
      <div className="flex justify-between items-center mb-4">
        <button
          type="button"
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'h-7 w-7 bg-transparent p-0'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="font-medium">
          {getMonthName(today.getMonth())} {today.getFullYear()}
        </div>
        <button
          type="button"
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'h-7 w-7 bg-transparent p-0'
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
          <div
            key={day}
            className="text-muted-foreground text-center text-xs h-8 flex items-center justify-center"
          >
            {day}
          </div>
        ))}
        
        {Array.from({ length: 35 }, (_, i) => {
          const day = i - today.getDay() + 1
          const date = new Date(today.getFullYear(), today.getMonth(), day)
          const isCurrentMonth = date.getMonth() === today.getMonth()
          const isToday = formatDate(date) === formatDate(today)
          
          return (
            <button
              key={i}
              type="button"
              disabled={!isCurrentMonth}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'h-8 w-8 p-0 font-normal',
                !isCurrentMonth && 'opacity-30',
                isToday && 'bg-accent text-accent-foreground'
              )}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
      
      <div className="mt-3 text-xs text-muted-foreground text-center">
        This is a placeholder calendar component.
      </div>
    </div>
  )
}
