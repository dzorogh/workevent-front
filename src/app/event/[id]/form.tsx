"use client"

import { FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import AppLink from "@/components/ui/app-link"
import { Route } from "next"
import { z } from "zod"
import { reachGoal } from "@/components/yandex-metrika-goals"

export default function EventForm() {
    
    const formSchema = z.object({
        name: z.string().min(3, { message: 'Имя должно содержать минимум 3 символа' }),
        email: z.string().email({ message: 'Некорректный email' }),
        phone: z.string().min(10, { message: 'Телефон должен содержать минимум 10 символов' }),
        comment: z.string().optional(),
    });

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        reachGoal('event_apply')
    }

    return (
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <div className="flex flex-col md:flex-row gap-x-2 gap-y-4">
                <Input placeholder="ФИО" />
                <Input placeholder="Электронная почта" />
                <Input placeholder="Телефон" />
            </div>

            <Textarea placeholder="Комментарий" />

            <div className="text-xs text-muted-foreground-dark">Нажимая на кнопку, вы соглашаетесь с <AppLink href={`/` as Route} variant="underline">политикой конфиденциальности</AppLink></div>
            
            <div className="flex">
                <Button variant="primary" type="submit">Оставить заявку</Button>
            </div>
        </form>
    )
}