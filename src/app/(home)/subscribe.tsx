"use client";

import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { IconMail } from "@tabler/icons-react";
import { IndustryResource } from "@/lib/types";
import { reachGoal } from "@/components/yandex-metrika-goals";

const FormSchema = z.object({
    industries: z.array(z.string()),
    email: z.string().email('Введите корректный email'),
});

type FormValues = z.infer<typeof FormSchema>;

export default function Subscribe({ industries }: { industries: IndustryResource[] }) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            industries: [],
            email: '',
        },
    });

    const selectedIndustries = form.watch('industries');

    const onSubmit = async (data: FormValues) => {
        const payload = {
            ...data,
            industries: data.industries.length
                ? data.industries
                : industries.map((industry) => industry.id.toString()),
        };

        try {
            await fetch('/api/subscribe', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            reachGoal('newsletter_subscribe');

            toast({
                title: "Успешно!",
                description: "Вы успешно подписались на рассылку",
            });
            form.reset();
        } catch {
            toast({
                title: "Ошибка",
                description: "Что-то пошло не так. Попробуйте позже",
                variant: "destructive",
            });
        }
    };

    const toggleIndustry = (industryId: string) => {
        const current = form.getValues('industries');
        const updated = current.includes(industryId)
            ? current.filter(id => id !== industryId)
            : [...current, industryId];
        form.setValue('industries', updated, { shouldValidate: true });
    };

    return (
        <div className="rounded-[20px] min-[768px]:rounded-[12px] bg-[#EBEBFD] px-5 py-5 min-[1200px]:h-[116px] min-[1200px]:px-8 min-[1200px]:py-0">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid h-full min-w-0 grid-cols-1 min-[1200px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_auto] items-center gap-4 min-[1200px]:gap-6">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white">
                            <IconMail className="size-5 text-[#657087]" stroke={1.75} />
                        </div>
                        <div className="min-w-0">
                            <div className="text-[11px] uppercase tracking-[0.14em] text-[#657087] mb-1">
                                события по вашим интересам
                            </div>
                            <div className="font-semibold text-[18px] leading-snug text-[#090D2B]">
                                Главные события — в вашей почте
                            </div>
                        </div>
                    </div>

                    <p className="text-[14px] leading-5 text-[#657087] max-w-md">
                        Подбираем мероприятия по интересам и присылаем{' '}
                        <span className="subscribe-copy-live">подборку на почту.</span>
                        <span className="subscribe-copy-concept hidden">раз в неделю.</span>
                    </p>

                    <div className="flex flex-col min-[480px]:flex-row gap-2 items-stretch min-[480px]:items-center">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <button type="button" className="subscribe-industries-trigger text-xs text-[#657087] underline underline-offset-4 mr-1 max-[767px]:order-last">
                                    {selectedIndustries.length ? `Отрасли: ${selectedIndustries.length}` : 'Отрасли'}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto min-w-64 p-0" align="end">
                                <div className="flex flex-col gap-4 p-5">
                                    {industries.map((industry) => (
                                        <div key={industry.id} className="flex items-center gap-x-2">
                                            <Checkbox
                                                id={industry.id.toString()}
                                                checked={selectedIndustries.includes(industry.id.toString())}
                                                onCheckedChange={() => toggleIndustry(industry.id.toString())}
                                            />
                                            <label
                                                htmlFor={industry.id.toString()}
                                                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {industry.title}
                                            </label>
                                        </div>
                                    ))}
                                    <Button
                                        variant="primary"
                                        onClick={() => setOpen(false)}
                                        type="button"
                                    >
                                        Применить
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <div className="min-w-0 min-[480px]:w-52">
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="email"
                                        placeholder="Ваш e-mail"
                                        className="rounded-lg h-11 bg-white border-0 shadow-none"
                                    />
                                )}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="rounded-lg h-11 px-6 bg-[#4545EF] text-white hover:bg-[#3838d4] bg-none from-transparent to-transparent shadow-none ring-0"
                        >
                            Подписаться
                        </Button>
                    </div>
                </form>
            </Form>
            {form.formState.errors.email && (
                <p className="text-destructive text-sm mt-2">
                    {form.formState.errors.email.message}
                </p>
            )}
            <div className="subscribe-legal text-xs text-[#657087] mt-2 min-[768px]:mt-0 min-[768px]:absolute min-[768px]:sr-only">
                Нажимая на кнопку, вы соглашаетесь с{' '}
                <Link href="/" className="underline underline-offset-4">
                    политикой конфиденциальности
                </Link>
            </div>
        </div>
    );
}
