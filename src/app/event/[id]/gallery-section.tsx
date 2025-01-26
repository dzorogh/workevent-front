'use client';

import React from 'react';
import Image from 'next/image';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface GallerySectionProps {
    images: string[];
    eventTitle: string;
    size?: 'sm' | 'md' | 'lg';
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

export default function GallerySection({ images, eventTitle, size = 'md' }: GallerySectionProps) {
    const [open, setOpen] = React.useState(false);
    const [imageIndex, setImageIndex] = React.useState(0);

    const slides = images.map((image, index) => ({
        src: image,
        alt: `${eventTitle} фото ${index + 1}`,
    }));

    return (
        <section>
            <Carousel>
                <CarouselContent className="w">
                    {images.map((image, index) => (
                        <CarouselItem key={index} className="basis-[21%]">
                            <a key={index} href={image} target="_blank" onClick={(e) => {
                                e.preventDefault();
                                setImageIndex(index);
                                setOpen(true);
                            }}>
                                <Image
                                    src={image}
                                    alt={`${eventTitle} фото ${index + 1}`}
                                    width={400}
                                    height={400}
                                    className="rounded-sm"
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
