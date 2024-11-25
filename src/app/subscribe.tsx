"use client";

import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Overlay } from "@/components/ui/overlay";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { IconCaretDownFilled } from "@tabler/icons-react";
import {IndustryResource} from "@/lib/api/types";

const FormSchema = z.object({
    industries: z.array(z.string()).min(1, 'Выберите хотя бы одну отрасль'),
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
        try {
            // Replace with your API call
            await fetch('/api/subscribe', {
                method: 'POST',
                body: JSON.stringify(data),
            });

            toast({
                title: "Успешно!",
                description: "Вы успешно подписались на рассылку",
            });
            form.reset();
        } catch (error) {
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
        form.setValue('industries', updated);
    };

    return (
        <div className="flex flex-col gap-8 px-10 py-12 justify-center bg-gradient-to-r from-brand to-brand-dark rounded-lg text-brand-foreground bg-cover bg-center relative">
            <Image
                src="/subscribe-bg.svg"
                alt=""
                fill
                className="absolute !right-0 !left-auto !w-auto top-0 mix-blend-screen z-0"
            />

            <h2 className="text-2xl max-w-xl relative z-10">
                Будьте в курсе всех актуальных мероприятий — подпишитесь на нашу рассылку
            </h2>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 relative z-10">
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                        <div className="min-w-48">
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <div className="relative">
                                        <Input
                                            placeholder="Выберите отрасль"
                                            value={selectedIndustries.length ? `Выбрано: ${selectedIndustries.length}` : ''}
                                            readOnly
                                            className="cursor-pointer"
                                            type="text"
                                        />
                                        <IconCaretDownFilled className="absolute text-muted-foreground opacity-50 right-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-transform" />
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto min-w-64 p-0" align="start">
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
                                            variant="brand"
                                            onClick={() => setOpen(false)}
                                            type="button"
                                        >
                                            Применить
                                        </Button>
                                    </div>
                                    <Overlay onClick={() => setOpen(false)} />
                                </PopoverContent>
                            </Popover>
                            {form.formState.errors.industries && (
                                <p className="text-red-500 text-sm mt-1">
                                    {form.formState.errors.industries.message}
                                </p>
                            )}
                        </div>

                        <div className="min-w-48">
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="email"
                                        placeholder="Укажите вашу почту"
                                    />
                                )}
                            />
                            {form.formState.errors.email && (
                                <p className="text-red-500 text-sm mt-1">
                                    {form.formState.errors.email.message}
                                </p>
                            )}
                        </div>

                        <Button type="submit">Подписаться</Button>
                    </div>

                    <div className="text-sm text-muted">
                        Нажимая на кнопку, вы соглашаетесь с{' '}
                        <Link href="/privacy" className="underline underline-offset-4">
                            политикой конфиденциальности
                        </Link>
                    </div>
                </form>
            </Form>
        </div>
    );
}
