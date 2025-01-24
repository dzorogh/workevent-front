"use client"

import * as React from "react"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker";


import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { ru } from "date-fns/locale"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  
  return (
    <DayPicker
      locale={ru}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        chevron: "fill-primary",
        caption_label: "",
        day: "rounded-full relative p-0 text-center text-sm focus-within:relative focus-within:z-20 aria-selected:bg-muted data-[outside]:opacity-50 data-[outside]:text-muted-foreground",
        day_button: "h-8 w-8 flex items-center justify-center",
        // dropdown: "",
        // dropdown_root: "",
        // dropdowns: "",
        // footer: "",
        // month: "",
        month_caption: "text-sm font-medium capitalize text-center h-8 flex items-center justify-center",
        month_grid: "month-grid w-full border-collapse space-y-1 ",
        months: "flex flex-col sm:flex-row gap-4",
        months_dropdown: "",
        nav: "absolute top-4 left-0 right-0",
        button_next: "absolute right-4",
        button_previous: "absolute left-4",
        range_end: "bg-gradient-to-r from-primary to-primary-dark text-primary-foreground",
        range_start: "bg-gradient-to-r from-primary to-primary-dark text-primary-foreground",
        // root: "",
        weeks: "flex flex-col gap-1",
        week: "grid grid-cols-7 gap-1",
        // weekday: "",
        weekdays: "grid grid-cols-7 gap-1",
        weekday: "text-muted-foreground capitalize font-normal text-xs",
        // week_number: "",
        // week_number_header: "",
        // years_dropdown: "",



        // months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        // month: "space-y-4",
        // caption: "flex justify-center pt-1 relative items-center",
        // nav: "space-x-1 flex items-center",
        // nav_button: cn(
        //   buttonVariants({ variant: "outline" }),
        //   "h-7 w-7 bg-transparent p-0 hover:opacity-100"
        // ),
        // table: "w-full border-collapse space-y-1 ",
        // head_row: "flex",
        // head_cell:
        //   "text-muted-foreground rounded-full grow capitalize font-normal text-[0.8rem]",
        // row: "flex w-full mt-2 gap-1",
        // cell: cn(
        //   "rounded-full relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50",
        // ),w
        // day: cn(
        //   buttonVariants({ variant: "ghost" }),
        //   "h-8 w-8 p-0 font-normal aria-selected:opacity-100 rounded-full font-light"
        // ),
        // day_range_start: "day-range-start bg-gradient-to-r from-primary to-primary-dark ",
        // day_range_end: "day-range-end bg-gradient-to-r from-primary to-primary-dark ",
        // day_selected:
        //   "text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        // day_today: "bg-accent text-accent-foreground",
        // day_outside:
        //   "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        // day_disabled: "text-muted-foreground opacity-50",
        // day_range_middle:
        //   "aria-selected:bg-accent aria-selected:text-accent-foreground",
        // day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        // IconLeft: () => <IconChevronLeft className="h-4 w-4" />,
        // IconRight: () => <IconChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
