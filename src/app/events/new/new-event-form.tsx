'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { IndustryResource } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import ClearableSelect from '@/components/clearable-select';
import { Form, FormField } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Api } from '@/lib/api';
import { env } from '@/config/env';

const FormSchema = z.object({
  title: z.string().min(1, 'Укажите название'),
  dateFrom: z.string().min(1, 'Укажите дату начала'),
  dateTo: z.string().optional(),
  city: z.string().min(1, 'Укажите город'),
  industryId: z.string().optional(),
  contact: z.string().min(1, 'Укажите сайт или email'),
  comment: z.string().optional(),
}).refine((data) => {
  const value = data.contact.trim();
  return value.includes('@') || /^https?:\/\//i.test(value) || value.includes('.');
}, {
  message: 'Укажите сайт или email',
  path: ['contact'],
});

type FormValues = z.infer<typeof FormSchema>;

export default function NewEventForm({ industries }: { industries: IndustryResource[] }) {
  const { toast } = useToast();
  const captchaRef = useRef<HCaptcha>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      dateFrom: '',
      dateTo: '',
      city: '',
      industryId: '',
      contact: '',
      comment: '',
    },
  });

  async function onSubmit(data: FormValues) {
    setCaptchaError(null);
    captchaRef.current?.resetCaptcha();

    let token = '';
    try {
      const executed = await captchaRef.current?.execute({ async: true });
      token = executed?.response ?? '';
    } catch {
      setCaptchaError('Пройдите проверку ещё раз');
      return;
    }

    if (!token) {
      setCaptchaError('Пройдите проверку ещё раз');
      return;
    }

    const industry = industries.find((item) => item.id.toString() === data.industryId);
    const { error, response } = await Api.POST('/v1/event-submissions', {
      body: {
        title: data.title,
        date_from: data.dateFrom,
        date_to: data.dateTo || undefined,
        city: data.city,
        industry_id: industry ? industry.id : undefined,
        contact: data.contact,
        comment: data.comment || undefined,
        'h-captcha-response': token,
      },
      cache: 'no-store',
    });

    captchaRef.current?.resetCaptcha();

    if (!error && response.ok) {
      toast({ title: 'Заявку приняли, свяжемся' });
      form.reset();
      return;
    }

    const status = response.status;
    if (status === 422) {
      const fieldErrors = (error as { errors?: Record<string, string[]> } | undefined)?.errors ?? {};
      for (const [field, messages] of Object.entries(fieldErrors)) {
        const formField = field === 'date_from' ? 'dateFrom'
          : field === 'date_to' ? 'dateTo'
            : field === 'industry_id' ? 'industryId'
              : field === 'h-captcha-response' ? undefined
                : field;
        if (formField && messages[0]) {
          form.setError(formField as keyof FormValues, { message: messages[0] });
        }
        if (field === 'h-captcha-response') {
          setCaptchaError(messages[0] ?? 'Пройдите проверку ещё раз');
        }
      }
      return;
    }

    toast({
      title: status === 429 ? 'Слишком много попыток, подождите минуту' : 'Попробуйте позже',
      variant: 'destructive',
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 max-w-xl">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Название</Label>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <Input id="title" {...field} placeholder="Название мероприятия" />
            )}
          />
          {form.formState.errors.title && (
            <p className="text-destructive text-sm">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="dateFrom">Дата начала</Label>
            <FormField
              control={form.control}
              name="dateFrom"
              render={({ field }) => (
                <Input id="dateFrom" type="date" {...field} />
              )}
            />
            {form.formState.errors.dateFrom && (
              <p className="text-destructive text-sm">{form.formState.errors.dateFrom.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="dateTo">Дата окончания</Label>
            <FormField
              control={form.control}
              name="dateTo"
              render={({ field }) => (
                <Input id="dateTo" type="date" {...field} />
              )}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="city">Город</Label>
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <Input id="city" {...field} placeholder="Москва" />
            )}
          />
          {form.formState.errors.city && (
            <p className="text-destructive text-sm">{form.formState.errors.city.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label>Отрасль</Label>
          <FormField
            control={form.control}
            name="industryId"
            render={({ field }) => (
              <ClearableSelect
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Выберите отрасль"
                options={industries.map((industry) => ({
                  value: industry.id.toString(),
                  label: industry.title,
                }))}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="contact">Сайт или email</Label>
          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <Input id="contact" {...field} placeholder="hello@example.com" />
            )}
          />
          {form.formState.errors.contact && (
            <p className="text-destructive text-sm">{form.formState.errors.contact.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="comment">Комментарий</Label>
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <Textarea id="comment" {...field} placeholder="Коротко о событии" rows={4} />
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <HCaptcha
            ref={captchaRef}
            sitekey={env.hcaptchaSiteKey}
            onExpire={() => captchaRef.current?.resetCaptcha()}
            languageOverride="ru"
          />
          {captchaError && (
            <p className="text-destructive text-sm">{captchaError}</p>
          )}
        </div>

        <Button type="submit" variant="primary" className="rounded-full w-fit px-8">
          Отправить заявку
        </Button>
      </form>
    </Form>
  );
}
