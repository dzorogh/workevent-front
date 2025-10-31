import { EventResource } from "@/lib/types";
import Image from "next/image";
import GallerySection from "./gallery-section";

interface ImagesProps {
    event: EventResource
    className?: string;
}

export default function Images({ event, className }: ImagesProps) {
    return (
        <div className={`flex flex-col gap-8 ${className}`}>
            <div className="md:sticky top-4 flex flex-col gap-4">
                <Image
                    priority={true}
                    src={event.cover}
                    alt={event.title}
                    width={1000}
                    height={500}
                    className="rounded-lg hidden md:block"
                />

                <GallerySection event={event}  />
            </div>
        </div>
    )
}