import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import Menu from '@/components/Menu'
import Auth from '@/components/Auth'
import Logo from '@/components/Logo'
import "./globals.css";



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
        className={`${inter.className} antialiased py-5`}
      >
        <div className="container max-w-screen-xl mx-auto">
          <header className="rounded-lg bg-gradient-to-r from-secondary to-secondary-dark p-[2px]">
              <div className="flex justify-between items-center px-4 py-2 bg-white rounded-md gap-4">
                <Logo className="h-10" />
                <Menu />
                <Auth />
              </div>
          </header>

          {children}
        </div>
      </body>
    </html>
  );
}
