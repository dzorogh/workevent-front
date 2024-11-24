import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import Header from '@/app/header'
import Footer from '@/app/footer'
import Container from '@/components/ui/container'
import "@/app/globals.css";
import React from "react";
import Subscribe from "@/app/subscribe";
import Api from "@/lib/api";


const inter = Inter({
    subsets: ['latin', 'cyrillic'],
    display: 'swap',
})

const getPage = async () => {
  const pageResponse = await Api.GET('/v1/pages', {
    cache: 'force-cache',
    revalidate: 300,
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
        <Container className="pt-5">
          <Header />
        </Container>

        <Container className="pt-20">
          {children}
        </Container>

        <Container className="pt-20 pb-20">
          <Subscribe industries={industries?.data ?? []} />
        </Container>
        
        <Footer />
      </body>
    </html>
  );
}
