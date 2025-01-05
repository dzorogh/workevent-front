import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import Header from '@/app/header'
import Footer from '@/app/footer'
import Container from '@/components/ui/container'
import "@/app/globals.css";
import React, { Suspense } from "react";
import Subscribe from "@/app/subscribe";
import { Api } from "@/lib/api";
import YandexMetrika from "@/components/yandex-metrika";
import YandexMetrikaCounter from "@/components/yandex-metrika-counter";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from '@vercel/analytics/next';
import NextTopLoader from "nextjs-toploader";

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
})

export const revalidate = false;

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
    title: page?.metadata?.title ?? "Workevent",
    description: page?.metadata?.description ?? "Workevent",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const industries = await Api.GET('/v1/industries').then(res => res.data);

  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <NextTopLoader color="#4a4de3" shadow={false} crawlSpeed={5}  />

        <Container className="pt-2 md:pt-5">
          <Header />
        </Container>

        <Container className="pt-10 md:pt-20">
          {children}
        </Container>

        <Container className="pt-20 pb-20">
          <Subscribe industries={industries?.data ?? []} />
        </Container>

        <Footer />

        <YandexMetrikaCounter />
        <Suspense fallback={<></>}>
          <YandexMetrika />
        </Suspense>
        
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
