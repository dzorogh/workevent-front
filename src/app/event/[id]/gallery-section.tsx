'use client';

import { useState } from 'react';
import Image from 'next/image';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { EventResource } from '@/lib/types';

interface GallerySectionProps { 
    event: EventResource;
}

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

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

export default function GallerySection({ event }: GallerySectionProps) {
    const [open, setOpen] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);

    const slides = [
        {
            src: event.cover,
            alt: `${event.title} обложка мероприятия`,
            className: "md:hidden"
        }
    ]

    event.gallery.forEach((image, index) => {
        slides.push({
            src: image,
            alt: `${event.title} фото с мероприятия ${index + 1}`,
            className: ""
        });
    });

    return (
        <section>
            <Carousel>
                <CarouselContent className="w">
                    {slides.map((slide, index) => (
                        <CarouselItem key={index} className={`${slide.className} md:basis-[22%] basis-[90%]`}>
                            <a key={index} href={slide.src} target="_blank" onClick={(e) => {
                                e.preventDefault();
                                setImageIndex(index);
                                setOpen(true);
                            }}>
                                <Image
                                    src={slide.src}
                                    alt={slide.alt}
                                    width={400}
                                    height={400}
                                    className="rounded-sm aspect-video bg-white object-contain border border-border"
                                />
                            </a>

                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

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
