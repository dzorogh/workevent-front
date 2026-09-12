'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLink from '@/components/ui/app-link';
import { Form, FormField } from '@/components/ui/form';
import { Route } from 'next';
import { reachGoal } from '@/components/yandex-metrika-goals';
import { useToast } from '@/hooks/use-toast';
import {
    discoveryCardClass,
    discoveryFieldClass,
    discoveryFilterLabelClass,
    discoveryPrimaryButtonClass,
    discoverySectionTitleClass,
} from '@/lib/discovery-ui';

const FormSchema = z.object({
    name: z.string().min(3, { message: 'Имя должно содержать минимум 3 символа' }),
    email: z.string().email({ message: 'Некорректный email' }),
    phone: z.string().min(10, { message: 'Телефон должен содержать минимум 10 символов' }),
    comment: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

export default function EventForm({ organizerHref }: { organizerHref?: Route }) {
    const { toast } = useToast();
    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        reValidateMode: 'onChange',
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            comment: '',
        },
    });

    const onSubmit = () => {
        reachGoal('event_apply');

        if (organizerHref) {
            window.location.assign(organizerHref);
            return;
        }

        toast({
            title: 'Спасибо!',
            description: 'Мы передадим заявку организатору.',
        });
        form.reset();
    };

    return (
        <div className={`${discoveryCardClass} p-5 min-[768px]:p-6`}>
            <div className="mb-5 flex flex-col gap-1">
                <div className={discoveryFilterLabelClass}>участие</div>
                <h2 className={`${discoverySectionTitleClass} text-[22px] min-[1200px]:text-[22px] min-[1200px]:leading-7`}>
                    Оставьте заявку
                </h2>
                <p className="text-[14px] leading-5 text-[#657087]">
                    {organizerHref
                        ? 'Передадим организатору и откроем его сайт.'
                        : 'Передадим организатору. Ответ придёт на почту или телефон.'}
                </p>
            </div>

            <Form {...form}>
                <form className="flex flex-col gap-3" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <Input {...field} placeholder="ФИО" className={discoveryFieldClass} />
                        )}
                    />
                    {form.formState.errors.name && (
                        <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>
                    )}

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <Input
                                {...field}
                                type="email"
                                placeholder="Электронная почта"
                                className={discoveryFieldClass}
                            />
                        )}
                    />
                    {form.formState.errors.email && (
                        <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>
                    )}

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <Input
                                {...field}
                                type="tel"
                                placeholder="Телефон"
                                className={discoveryFieldClass}
                            />
                        )}
                    />
                    {form.formState.errors.phone && (
                        <p className="text-destructive text-sm">{form.formState.errors.phone.message}</p>
                    )}

                    <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                            <Textarea
                                {...field}
                                placeholder="Комментарий"
                                className="min-h-[88px] rounded-[16px] border-0 bg-[#F6F8FC] shadow-none focus-visible:ring-[#4545EF]"
                            />
                        )}
                    />

                    <p className="text-xs text-[#657087]">
                        Нажимая на кнопку, вы соглашаетесь с{' '}
                        <AppLink href={`/` as Route} variant="underline">
                            политикой конфиденциальности
                        </AppLink>
                    </p>

                    <button type="submit" className={discoveryPrimaryButtonClass}>
                        Оставить заявку
                    </button>
                </form>
            </Form>
        </div>
    );
}
