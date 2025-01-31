import { EventResource } from "@/lib/types";
import { Route } from "next";
import Link from "next/link";
import { formatPhone } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Globe from "@/components/icons/globe.png";
import Image from "next/image";
import Mail from "@/components/icons/mail.png";
import Phone from "@/components/icons/phone.png";
import ContactsItem from "./contacts-item";
import { encodeUrl, createSlugWithId } from "@/lib/utils";
import { ShareButtons } from "./share-buttons";

interface ContactsProps {
    event: EventResource;
}

export default function Contacts({ event }: ContactsProps) {
    return <div className="md:px-10 px-4 py-8 md:rounded-lg bg-secondary -mx-4 md:mx-0 md:w-full">
        <div className="flex flex-col gap-6">
            <div className="text-primary-dark font-semibold">{event.title}</div>
            <div className="flex flex-col md:flex-row gap-4">
                {event.website && <ContactsItem link={encodeUrl(event.website, { utm_campaign: 'participate' }) as Route} icon={<Image src={Globe} alt="Globe" width={40} height={40} />} text={new URL(event.website).hostname} />}
                {event.email && <ContactsItem link={`mailto:${event.email}`} icon={<Image src={Mail} alt="Mail" width={40} height={40} />} text={event.email} />}
                {event.phone && <ContactsItem link={`tel:${event.phone}`} icon={<Image src={Phone} alt="Phone" width={40} height={40} />} text={formatPhone(event.phone)} />}
            </div>
            <div className="flex flex-col md:flex-row gap-4">
                <Button variant="primary" size="lg" asChild className="px-12 h-12">
                    <Link href={`/event/${event.id}/form` as Route}>Принять участие</Link>
                </Button>

                <ShareButtons url={`https://workevent.ru/event/${createSlugWithId(event.title, event.id)}`} title={event.title} image={event.cover} size={42} />
            </div>
        </div>
    </div>
}