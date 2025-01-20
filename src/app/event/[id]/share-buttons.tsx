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
  
  export function ShareButtons({ url, title, image }: { url: string, title: string, image: string }) {
    return (
        <>
            <div className="flex flex-wrap gap-2">
                <FacebookShareButton url={url}>
                    <FacebookIcon size={32} round={true} />
                </FacebookShareButton>
                <TwitterShareButton url={url} title={title}  >
                    <TwitterIcon size={32} round={true} />
                </TwitterShareButton>
                <TelegramShareButton url={url} title={title} >
                    <TelegramIcon size={32} round={true} />
                </TelegramShareButton>
                <WhatsappShareButton url={url} title={title} >
                    <WhatsappIcon size={32} round={true} />
                </WhatsappShareButton>
                <VKShareButton url={url} title={title} image={image} >
                    <VKIcon size={32} round={true} />
                </VKShareButton>
                <EmailShareButton url={url} title={title} >
                    <EmailIcon size={32} round={true} />
                </EmailShareButton>
                <LinkedinShareButton url={url} title={title} >
                    <LinkedinIcon size={32} round={true} />
                </LinkedinShareButton>
                <MailruShareButton url={url} title={title} >
                    <MailruIcon size={32} round={true} />
                </MailruShareButton>
            </div>

        </>
    )
}