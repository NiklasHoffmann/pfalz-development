import { ImageResponse } from 'next/og';

export const alt =
  'Pfalz Development - Webdesign und Webentwicklung fuer Unternehmen in der Pfalz';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        padding: '48px',
        background:
          'radial-gradient(circle at top left, rgba(245, 158, 11, 0.22), transparent 34%), linear-gradient(135deg, #f6efe4 0%, #efe4d2 52%, #e4d6c0 100%)',
        color: '#1c1917',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          borderRadius: '32px',
          border: '1px solid rgba(120, 53, 15, 0.14)',
          padding: '44px',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.74) 0%, rgba(255,255,255,0.9) 100%)',
          boxShadow: '0 24px 60px rgba(28, 25, 23, 0.12)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#92400e',
            }}
          >
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '999px',
                background: '#d97706',
                display: 'flex',
              }}
            />
            Pfalz Development
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: '999px',
              border: '1px solid rgba(146, 64, 14, 0.16)',
              padding: '12px 18px',
              fontSize: '22px',
              color: '#57534e',
              background: 'rgba(255,255,255,0.72)',
            }}
          >
            Neustadt an der Weinstrasse · Pfalz
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxWidth: '920px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: '82px',
              lineHeight: 1.02,
              fontWeight: 800,
              letterSpacing: '-0.05em',
            }}
          >
            Handgemachte Websites aus der Pfalz.
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '33px',
              lineHeight: 1.3,
              color: '#44403c',
              maxWidth: '860px',
            }}
          >
            Webdesign, Webentwicklung und lokale SEO-Grundlagen fuer
            Unternehmen, Gastgeber und Betriebe in der Region.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
            }}
          >
            {[
              'Webdesign',
              'Webentwicklung',
              'Lokale SEO',
              'Hosting & Pflege',
            ].map((label) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  borderRadius: '999px',
                  padding: '12px 18px',
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#78350f',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(217, 119, 6, 0.18)',
                }}
              >
                {label}
              </div>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '28px',
              fontWeight: 700,
              color: '#1f2937',
            }}
          >
            pfalz-development.de
          </div>
        </div>
      </div>
    </div>,
    size
  );
}
