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
import { Overlay } from "@/components/ui/overlay"
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { IconLoader } from '@tabler/icons-react';
import { useRouter } from 'next/navigation'
import { CityResource, IndustryResource, EventIndexParametersQuery } from "@/lib/types";

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
  industry: z.string().optional(),
  city: z.string().optional(),
})

interface SearchProps {
  industries: IndustryResource[];
  cities: CityResource[];
  initialParams?: SearchParams;
}

export default function Search({ industries, cities, initialParams = {} }: SearchProps) {
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
      industry: initialParams.industry_id?.toString() || '',
      city: initialParams.city_id?.toString() || '',
    }
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const searchParams: Record<string, string> = {};

    if (data.query) searchParams.query = data.query;
    if (date?.from) searchParams.date_from = String(date.from.getTime() / 1000);
    if (date?.to) searchParams.date_to = String(date.to.getTime() / 1000);
    if (data.industry) searchParams.industry_id = data.industry;
    if (data.city) searchParams.city_id = data.city;

    const params = new URLSearchParams(searchParams);
    router.push(`/events?${params.toString()}`);
  }

  const [open, setOpen] = useState(false)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="flex flex-wrap overflow-x-auto gap-4 rounded-lg bg-gradient-to-r from-primary to-primary-dark md:py-5 py-4 md:px-8 px-4 text-primary-foreground font-normal items-end">
          <div className="flex flex-col gap-2 w-full md:w-48">
            <div className="md:text-lg text-sm">Поиск события</div>
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <Input {...field} placeholder="Название, отрасль, город" />
              )}
            />
          </div>
          <div className="flex flex-col gap-2 w-full md:w-48">
            <div className="md:text-lg text-sm">Даты проведения</div>
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative cursor-pointer">
                      {!(date?.from || date?.to) && (
                        <div className="flex items-center gap-2 absolute top-0 left-0 text-muted-foreground h-full w-full justify-between px-4 select-none text-sm">
                          <div className="grow">С</div>
                          <div className="w-px h-5 bg-border"></div>
                          <div className="grow">По</div>
                        </div>
                      )}
                      <Input
                        {...field}
                        value={
                          date?.from || date?.to
                            ? [
                              date?.from?.toLocaleDateString('ru', { day: 'numeric', month: 'short', formatMatcher: 'best fit' }) ?? null,
                              date?.to?.toLocaleDateString('ru', { day: 'numeric', month: 'short', formatMatcher: 'best fit' }) ?? null
                            ].filter(Boolean).join(' - ')
                            : ''  // Provide empty string as default value
                        }
                        readOnly  // Make it read-only since it's controlled by the calendar
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <LazyCalendar
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                    />
                    <Overlay onClick={() => setOpen(false)} />
                  </PopoverContent>
                </Popover>
              )}
            />

          </div>
          <div className="flex flex-col gap-2 w-full md:w-48">
            <div className="md:text-lg text-sm">Отрасль</div>
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <ClearableSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Отрасль"
                  options={industries.map(industry => ({
                    value: industry.id.toString(),
                    label: industry.title
                  }))}
                />
              )}
            />
          </div>
          <div className="flex flex-col gap-2 w-full md:w-48">
            <div className="md:text-lg text-sm">Город</div>
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <ClearableSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Город"
                  options={cities.map(city => ({
                    value: city.id.toString(),
                    label: city.title
                  }))}
                />
              )}
            />
          </div>
          <div className="flex flex-col gap-2 w-full md:w-32">
            <Button variant="success" type="submit">Поиск</Button>
          </div>
        </div>
      </form>
    </Form>

  );
}
