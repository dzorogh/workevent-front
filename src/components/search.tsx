'use client';

import { Input } from "@/components/ui/input"
import {
  Form,
  FormField,
} from "@/components/ui/form"
import { z } from "zod"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast"
import ClearableSelect from '@/components/clearable-select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker"
import { useState } from 'react';
import { Overlay } from "@/components/ui/overlay"
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { IconLoader } from '@tabler/icons-react';


const LazyCalendar = dynamic(() => import('@/components/ui/calendar').then(mod => mod.Calendar), {
  loading: () => (
    <div className="rounded-lg bg-white h-[347px] w-[571px] flex items-center justify-center">
      <IconLoader className="animate-spin text-muted-foreground" />
    </div>
  ),
  ssr: false,
})


const FormSchema = z.object({
  query: z.string(),
  dateRange: z.string(),
  industry: z.string(),
  city: z.string(),
})

export default function Search() {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  const [date, setDate] = useState<DateRange | undefined>()

  const [open, setOpen] = useState(false)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="flex gap-4 rounded-lg bg-gradient-to-r from-brand to-brand-dark py-5 px-8 text-brand-foreground font-normal items-end">
          <div className="flex-[1.5] flex flex-col gap-2">
            <div className="text-lg">Поиск события</div>
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <Input {...field} placeholder="Название, отрасль, город" />
              )}
            />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="text-lg">Даты проведения</div>
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative cursor-pointer">
                      {!(date?.from || date?.to) ?
                        <div className="flex items-center gap-2 absolute top-0 left-0 text-muted-foreground h-full w-full justify-between px-4 select-none text-sm">
                          <div className="grow">С</div>
                          <div className="w-px h-5 bg-border"></div>
                          <div className="grow">По</div>
                        </div> : ""
                      }
                      <Input {...field} value={
                        [
                          date?.from?.toLocaleDateString('ru', { day: 'numeric', month: 'short', formatMatcher: 'best fit' }) ?? null,
                          date?.to?.toLocaleDateString('ru', { day: 'numeric', month: 'short', formatMatcher: 'best fit' }) ?? null
                        ].filter(Boolean).join(' - ')
                      }
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
          <div className="flex-1 flex flex-col gap-2">
            <div className="text-lg">Отрасль</div>
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <ClearableSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Отрасль"
                  options={[
                    { value: 'gas', label: 'Нефть и газ' },
                    { value: 'it', label: 'IT' },
                  ]}
                />
              )}
            />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="text-lg">Город</div>
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <ClearableSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Город"
                  options={[
                    { value: 'moscow', label: 'Москва' },
                    { value: 'spb', label: 'Санкт-Петербург' },
                  ]}
                />
              )}
            />
          </div>
          <div className="flex-[0.5] flex flex-col gap-2">
            <Button variant="primary">Поиск</Button>
          </div>
        </div>
      </form>
    </Form>

  );
}
