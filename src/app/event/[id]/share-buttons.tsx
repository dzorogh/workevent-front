"use client"

import {
    EmailShareButton,
    FacebookShareButton,
    LinkedinShareButton,
    LivejournalShareButton,
    MailruShareButton,
    OKShareButton,
    PinterestShareButton,
    TelegramShareButton,
    TwitterShareButton,
    VKShareButton,
    WhatsappShareButton,
  } from "react-share";

  import {
    EmailIcon,
    FacebookIcon,
    FacebookMessengerIcon,
    GabIcon,
    HatenaIcon,
    InstapaperIcon,
    LineIcon,
    LinkedinIcon,
    LivejournalIcon,
    MailruIcon,
    OKIcon,
    PinterestIcon,
    PocketIcon,
    RedditIcon,
    TelegramIcon,
    TumblrIcon,
    TwitterIcon,
    ViberIcon,
    VKIcon,
    WeiboIcon,
    WhatsappIcon,
    WorkplaceIcon,
    XIcon,
  } from "react-share";
  
  export function ShareButtons({ url, title, image, size }: { url: string, title: string, image: string, size: number }) {

    return (
        <>
            <div className="flex flex-wrap gap-2 items-center md:justify-start justify-center">
                <TelegramShareButton url={url} title={title} >
                    <TelegramIcon size={size} round={true} />
                </TelegramShareButton>

                <WhatsappShareButton url={url} title={title} >
                    <WhatsappIcon size={size} round={true} />
                </WhatsappShareButton>

                <VKShareButton url={url} title={title} image={image} >
                    <VKIcon size={size} round={true} />
                </VKShareButton>

                <EmailShareButton url={url} title={title} >
                    <EmailIcon size={size} round={true} />
                </EmailShareButton>
            </div>

        </>
    )
}