import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import Header from '@/app/header'
import Footer from '@/app/footer'
import Container from '@/components/ui/container'
import "@/app/globals.css";

const inter = Inter({
    subsets: ['latin', 'cyrillic'],
    display: 'swap',
})

export const metadata: Metadata = {
  title: "Workevent",
  description: "Workevent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <Container className="pt-5">
          <Header />
        </Container>

        <Container>
          {children}
        </Container>

        <Footer />
      </body>
    </html>
  );
}
