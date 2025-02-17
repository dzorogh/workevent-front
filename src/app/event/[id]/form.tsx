import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import AppLink from "@/components/ui/app-link"
import { Route } from "next"
import { z } from "zod"

export default function EventForm() {
    
    const formSchema = z.object({
        name: z.string().min(3, { message: 'Имя должно содержать минимум 3 символа' }),
        email: z.string().email({ message: 'Некорректный email' }),
        phone: z.string().min(10, { message: 'Телефон должен содержать минимум 10 символов' }),
        comment: z.string().optional(),
    });


    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-x-2 gap-y-4">
                <Input placeholder="ФИО" />
                <Input placeholder="Электронная почта" />
                <Input placeholder="Телефон" />
            </div>

            <Textarea placeholder="Комментарий" />

            <div className="text-xs text-muted-foreground-dark">Нажимая на кнопку, вы соглашаетесь с <AppLink href={`/` as Route} variant="underline">политикой конфиденциальности</AppLink></div>
            
            <div className="flex">
                <Button variant="primary">Оставить заявку</Button>
            </div>
        </div>
    )
}