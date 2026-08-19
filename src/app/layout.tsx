import type { Metadata } from "next";
import { Geist } from 'next/font/google'
import Header from '@/app/header'
import Footer from '@/app/footer'
import Container from '@/components/ui/container'
import "@/app/globals.css";
import React, { Suspense } from "react";
import Subscribe from "@/app/(home)/subscribe";
import { Api } from "@/lib/api";
import YandexMetrika from "@/components/yandex-metrika";
import YandexMetrikaCounter from "@/components/yandex-metrika-counter";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from '@vercel/analytics/next';
import NextTopLoader from "nextjs-toploader";
import CookieBanner from "@/components/cookie-banner";
import { JsonLd } from "@/lib/seo/jsonld";
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/seo/jsonld-builders";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/constants";

const font = Geist({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  weight: ['400', '500', '700'],
})

export const revalidate = 300;

const getPage = async () => {
  const pageResponse = await Api.GET('/v1/pages', {
    params: {
      query: {
        path: '/',
      }
    }
  });
  return pageResponse.data?.data ?? undefined;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage();

  return {
    metadataBase: new URL(SITE_URL),
    ...buildMetadata(page?.metadata, {
      title: 'Все бизнес‑события России: семинары, форумы, тренинги и выставки - Workevent',
      description: 'Каталог деловых мероприятий на сайте Workevent. Поиск по датам, индустриям, городам. Контакты организаторов, отзывы участников, фото и видео. Инструменты организаторов',
      canonicalPath: '/',
      openGraph: {
        type: 'website',
        title: 'Все бизнес‑события России — Workevent',
        description: 'Каталог деловых мероприятий на сайте Workevent. Поиск по датам, индустриям, городам.',
        url: SITE_URL,
      },
    }),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const industries = await Api.GET('/v1/industries').then(res => res.data);

  return (
    <html lang="ru">
      <body
        className={`${font.className} antialiased`}
      >
        <JsonLd data={[buildWebSiteJsonLd(), buildOrganizationJsonLd()]} />
        <NextTopLoader color="#4a4de3" shadow={false} crawlSpeed={5} />

        <div className="flex flex-col gap-8">
          <Header />

          <Container>
            {children}
          </Container>

          <Container>
            <Subscribe industries={industries?.data ?? []} />
          </Container>

          <Footer />
        </div>

        <YandexMetrikaCounter />

        <Suspense fallback={<></>}>
          <YandexMetrika />
        </Suspense>

        <SpeedInsights />
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
