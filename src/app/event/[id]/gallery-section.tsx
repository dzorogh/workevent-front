'use client';

import React from 'react';
import Image from 'next/image';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import EventCoverImage from '@/components/event-cover-image';
import { cn } from '@/lib/utils';

interface GallerySectionProps {
    images: string[];
    eventTitle: string;
    size?: 'sm' | 'md' | 'lg';
}

const NextJsImageElement = ({ slide }: { slide: { src: string; alt?: string } }) => {

    return (
        <div className="relative w-full h-full">
            <Image
                fill
                alt={slide.alt || ''}
                src={slide.src}
                loading="eager"
                draggable={false}
                quality={80}
                className="object-contain"
                sizes={`80vw`}
            />
        </div>
    );
};

export default function GallerySection({ images, eventTitle, size = 'md' }: GallerySectionProps) {
    const [open, setOpen] = React.useState(false);
    const [imageIndex, setImageIndex] = React.useState(0);

    const slides = images.map((image, index) => ({
        src: image,
        alt: `${eventTitle} фото ${index + 1}`,
    }));

    return (
        <section>
            <div className={cn("grid gap-4", size === 'sm' && 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5', size === 'md' && 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4', size === 'lg' && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2')}>
                {images.map((image, index) => (
                    <a key={index} href={image} target="_blank" onClick={(e) => {
                        e.preventDefault();
                        setImageIndex(index);
                        setOpen(true);
                    }}>
                        <EventCoverImage cover={image} title={`${eventTitle} фото ${index + 1}`} size={size} />
                    </a>
                ))}
            </div>

            <Lightbox
                open={open}
                close={() => setOpen(false)}
                index={imageIndex}
                slides={slides}
                render={{ slide: NextJsImageElement }}
            />
        </section>
    );
}
