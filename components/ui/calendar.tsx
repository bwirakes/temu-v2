'use client'

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from 'lucide-react'
import * as React from 'react'
import { DayFlag, DayPicker, SelectionState, UI, CaptionProps } from 'react-day-picker'

import { cn } from '@/lib/utils'

import { buttonVariants } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  fromYear?: number
  toYear?: number
}

export const Calendar = ({
  className,
  classNames,
  showOutsideDays = true,
  fromYear,
  toYear,
  ...props
}: CalendarProps) => {
  const years = React.useMemo(() => {
    if (!fromYear || !toYear) return []
    return Array.from(
      { length: toYear - fromYear + 1 },
      (_, i) => fromYear + i
    ).reverse()
  }, [fromYear, toYear])

  const CustomCaption = React.useCallback(
    (props: CaptionProps) => {
      const { displayMonth, goToMonth } = props
      
      const handleYearChange = (year: string) => {
        const newDate = new Date(displayMonth)
        newDate.setFullYear(parseInt(year))
        goToMonth(newDate)
      }

      return (
        <div className="flex justify-center pt-1 relative items-center">
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => {
                const prevMonth = new Date(displayMonth)
                prevMonth.setMonth(prevMonth.getMonth() - 1)
                goToMonth(prevMonth)
              }}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
              )}
              title="Previous month"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium">
              {displayMonth.toLocaleDateString('id-ID', { month: 'long' })}
            </span>
            <button
              onClick={() => {
                const nextMonth = new Date(displayMonth)
                nextMonth.setMonth(nextMonth.getMonth() + 1)
                goToMonth(nextMonth)
              }}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
              )}
              title="Next month"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
          
          {years.length > 0 && (
            <Select
              value={displayMonth.getFullYear().toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="absolute right-1 h-7 w-[70px] text-xs">
                <SelectValue placeholder={displayMonth.getFullYear()} />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )
    },
    [years]
  )

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        [UI.Months]: 'relative',
        [UI.Month]: 'space-y-4 ml-0',
        [UI.MonthCaption]: 'flex justify-center items-center h-7',
        [UI.CaptionLabel]: 'text-sm font-medium',
        [UI.ButtonPrevious]: cn(
          buttonVariants({ variant: 'outline' }),
          'absolute left-1 top-0 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        [UI.ButtonNext]: cn(
          buttonVariants({ variant: 'outline' }),
          'absolute right-1 top-0 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        [UI.MonthGrid]: 'w-full border-collapse space-y-1',
        [UI.Weekdays]: 'flex',
        [UI.Weekday]:
          'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        [UI.Week]: 'flex w-full mt-2',
        [UI.Day]:
          'h-9 w-9 text-center rounded-md text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        [UI.DayButton]: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-primary hover:text-primary-foreground'
        ),
        [SelectionState.range_end]: 'day-range-end',
        [SelectionState.selected]:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        [SelectionState.range_middle]:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        [DayFlag.today]: 'bg-accent text-accent-foreground',
        [DayFlag.outside]:
          'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        [DayFlag.disabled]: 'text-muted-foreground opacity-50',
        [DayFlag.hidden]: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => <Chevron {...props} />,
        Caption: CustomCaption,
      }}
      {...props}
    />
  )
}

const Chevron = ({ orientation = 'left' }) => {
  switch (orientation) {
    case 'left':
      return <ChevronLeftIcon className="h-4 w-4" />
    case 'right':
      return <ChevronRightIcon className="h-4 w-4" />
    case 'up':
      return <ChevronUpIcon className="h-4 w-4" />
    case 'down':
      return <ChevronDownIcon className="h-4 w-4" />
    default:
      return null
  }
}
