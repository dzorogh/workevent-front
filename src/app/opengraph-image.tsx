import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/seo/constants';

export const runtime = 'edge';
export const alt = `${SITE_NAME} — каталог деловых мероприятий России`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '64px',
          background: 'linear-gradient(135deg, #494BE2 0%, #2426B0 100%)',
          color: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: 24,
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            fontSize: 36,
            lineHeight: 1.3,
            maxWidth: 900,
            opacity: 0.95,
          }}
        >
          Каталог деловых мероприятий России: конференции, форумы, семинары и выставки
        </div>
      </div>
    ),
    { ...size },
  );
}
