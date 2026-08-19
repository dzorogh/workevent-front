import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function GotoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div>Перенаправление...</div>
      {children}
    </div>
  )
}
