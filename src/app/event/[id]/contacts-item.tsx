import Link from 'next/link';
import { Route } from 'next';
import { discoveryChipClass } from '@/lib/discovery-ui';

export default function ContactsItem({
    link,
    icon,
    text,
}: {
    link: string;
    icon: React.ReactNode;
    text: React.ReactNode;
}) {
    return (
        <Link href={link as Route} target="_blank" className={`${discoveryChipClass} h-11 gap-2`}>
            {icon}
            {text}
        </Link>
    );
}
