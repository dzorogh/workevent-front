import { EventResource } from "@/lib/types";
import Image from "next/image";
import GallerySection from "./gallery-section";

interface ImagesProps {
    event: EventResource
}

export default function Images({ event }: ImagesProps) {
    return (
        <div className="flex flex-col gap-8 w-1/2">
            <div className="sticky top-4">
                <Image
                    priority={true}
                    src={event.cover}
                    alt={event.title}
                    width={1000}
                    height={500}
                    className="rounded-lg"
                />

                <GallerySection images={event.gallery} eventTitle={event.title} size="lg" />
            </div>
        </div>
    )
}