'use client';

import { Input } from "@/components/ui/input"
import {
  Form,
  FormField,
} from "@/components/ui/form"
import { z } from "zod"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ClearableSelect from '@/components/clearable-select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker"
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { IconCalendar, IconCaretDownFilled, IconLoader, IconMapPin, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation'
import { CityResource, EventIndexParametersQuery } from "@/lib/types";

type SearchParams = NonNullable<EventIndexParametersQuery>;

const LazyCalendar = dynamic(() => import('@/components/ui/calendar').then(mod => mod.Calendar), {
  loading: () => (
    <div className="rounded-lg bg-white h-[347px] w-[571px] flex items-center justify-center">
      <IconLoader className="animate-spin text-muted-foreground" />
    </div>
  ),
  ssr: false,
})

const FormSchema = z.object({
  query: z.string().optional(),
  dateRange: z.string().optional(),
  city: z.string().optional(),
})

interface SearchProps {
  cities: CityResource[];
  initialParams?: SearchParams;
}

const fieldTriggerClass =
  "border-0 bg-transparent shadow-none ring-0 h-11 px-0 text-[15px] text-[#657087] focus:ring-0";

export default function Search({ cities, initialParams = {} }: SearchProps) {
  const router = useRouter()

  const [date, setDate] = useState<DateRange | undefined>(() => {
    const from = initialParams.date_from ? new Date(initialParams.date_from * 1000) : undefined;
    const to = initialParams.date_to ? new Date(initialParams.date_to * 1000) : undefined;
    return from || to ? { from, to } : undefined;
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      query: initialParams.query as string || '',
      dateRange: '',
      city: initialParams.city_id?.toString() || '',
    }
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const searchParams: Record<string, string> = {};

    if (data.query) searchParams.query = data.query;
    if (date?.from) searchParams.date_from = String(date.from.getTime() / 1000);
    if (date?.to) searchParams.date_to = String(date.to.getTime() / 1000);
    if (data.city) searchParams.city_id = data.city;

    const params = new URLSearchParams(searchParams);
    router.push(`/events?${params.toString()}`);
  }

  const [open, setOpen] = useState(false)
  const dateLabel = date?.from || date?.to
    ? [
      date?.from?.toLocaleDateString('ru', { day: 'numeric', month: 'short', formatMatcher: 'best fit' }) ?? null,
      date?.to?.toLocaleDateString('ru', { day: 'numeric', month: 'short', formatMatcher: 'best fit' }) ?? null
    ].filter(Boolean).join(' - ')
    : '';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col min-[1024px]:flex-row min-[1024px]:items-center gap-3 min-[1024px]:gap-0 rounded-[16px] min-[1024px]:rounded-[10px] border border-[#D4DAE8] bg-white min-[1024px]:h-[66px] px-3 py-2 min-[1024px]:py-0 min-[1024px]:pl-5 min-[1024px]:pr-2.5">
          <div className="flex min-w-0 grow items-center gap-2 min-[1024px]:flex-1">
            <IconSearch className="size-5 text-[#657087] shrink-0" stroke={1.75} />
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Название или тема"
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-11 px-0 text-[15px] placeholder:text-[#657087]"
                />
              )}
            />
          </div>
          <div className="hidden min-[1024px]:block w-px h-8 bg-[#D4DAE8] shrink-0 mx-2" />
          <div className="min-w-0 min-[1024px]:w-[220px] min-[1200px]:w-[260px]">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <IconMapPin className="size-5 text-[#657087] shrink-0" stroke={1.75} />
                  <ClearableSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Все города"
                    triggerClassName={fieldTriggerClass}
                    options={cities.map(city => ({
                      value: city.id.toString(),
                      label: city.title
                    }))}
                  />
                </div>
              )}
            />
          </div>
          <div className="hidden min-[1024px]:block w-px h-8 bg-[#D4DAE8] shrink-0 mx-2" />
          <div className="min-w-0 min-[1024px]:w-[180px] min-[1200px]:w-[220px]">
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <button type="button" className="flex w-full items-center gap-2 h-11 text-left">
                      <IconCalendar className="size-5 text-[#657087] shrink-0" stroke={1.75} />
                      <span className={`text-[15px] truncate ${dateLabel ? 'text-[#090D2B]' : 'text-[#657087]'}`}>
                        {dateLabel || 'Даты'}
                      </span>
                      <IconCaretDownFilled className="ml-auto size-3.5 text-[#657087]" />
                      <input type="hidden" {...field} value={dateLabel} readOnly />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <LazyCalendar
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>
          <Button
            type="submit"
            className="rounded-lg h-11 w-full shrink-0 bg-[#4545EF] text-white hover:bg-[#3838d4] bg-none from-transparent to-transparent shadow-none ring-0 min-[1024px]:h-[44px] min-[1024px]:w-[160px] min-[1200px]:w-[200px]"
          >
            Найти
          </Button>
        </div>
      </form>
    </Form>
  );
}
