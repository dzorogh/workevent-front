'use client';

import { useState } from 'react';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { EventResource } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

interface GallerySectionProps {
    event: EventResource;
}

const NextJsImageElement = ({ slide }: { slide: { src: string; alt?: string } }) => {
    return (
        <div className="relative h-full w-full">
            <Image
                fill
                alt={slide.alt || ''}
                src={slide.src}
                loading="eager"
                draggable={false}
                quality={80}
                className="object-contain"
                sizes="80vw"
            />
        </div>
    );
};

export default function GallerySection({ event }: GallerySectionProps) {
    const [open, setOpen] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);

    const slides = event.gallery.map((image, index) => ({
        src: image,
        alt: `${event.title} фото с мероприятия ${index + 1}`,
    }));

    if (slides.length === 0) {
        return null;
    }

    return (
        <section>
            <Carousel>
                <CarouselContent>
                    {slides.map((slide, index) => (
                        <CarouselItem key={slide.src} className="basis-[42%] min-[768px]:basis-[28%]">
                            <button
                                type="button"
                                className="block w-full overflow-hidden rounded-[12px]"
                                onClick={() => {
                                    setImageIndex(index);
                                    setOpen(true);
                                }}
                            >
                                <Image
                                    src={slide.src}
                                    alt={slide.alt}
                                    width={400}
                                    height={225}
                                    className="aspect-video w-full bg-white object-cover"
                                />
                            </button>
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
