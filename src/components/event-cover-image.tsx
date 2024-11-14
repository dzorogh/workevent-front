'use client';

import Image from 'next/image';
import Logo from '@/components/icons/logo';

interface EventCoverImageProps {
    cover?: string;
    title: string;
}

export default function EventCoverImage({ cover, title }: EventCoverImageProps) {
    const isSvg = cover?.endsWith('.svg');

    if (!cover) {
        return (
            <div className="flex items-center justify-center absolute inset-0">
                <Logo className="aspect-video *:fill-border" />
            </div>
        );
    }

    return (
        <>
            {!isSvg && <Image 
                src={cover} 
                alt={title} 
                className="object-cover invisible aspect-video blur scale-125 !-top-0.5" 
                onLoad={(e) => (e.target as HTMLImageElement).classList.remove('invisible')}
                sizes="300px"
                fill />}

            <Image 
                src={cover} 
                alt={title} 
                className={`${isSvg ? 'p-4' : ''} invisible object-contain`} 
                onLoad={(e) => (e.target as HTMLImageElement).classList.remove('invisible')}
                sizes="300px"
                fill />
        </>
    );
} 