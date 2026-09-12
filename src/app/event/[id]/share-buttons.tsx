'use client';

import {
    EmailShareButton,
    TelegramShareButton,
    VKShareButton,
    WhatsappShareButton,
    EmailIcon,
    TelegramIcon,
    VKIcon,
    WhatsappIcon,
} from 'react-share';

export function ShareButtons({
    url,
    title,
    image,
    size,
}: {
    url: string;
    title: string;
    image: string;
    size: number;
}) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <TelegramShareButton url={url} title={title}>
                <TelegramIcon size={size} round />
            </TelegramShareButton>
            <WhatsappShareButton url={url} title={title}>
                <WhatsappIcon size={size} round />
            </WhatsappShareButton>
            <VKShareButton url={url} title={title} image={image}>
                <VKIcon size={size} round />
            </VKShareButton>
            <EmailShareButton url={url} title={title}>
                <EmailIcon size={size} round />
            </EmailShareButton>
        </div>
    );
}
