/* eslint-disable @next/next/no-img-element */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';

export const alt =
  'Pfalz Development - Webdesign und Webentwicklung fÃ¼r Unternehmen in der Pfalz';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';
export const runtime = 'nodejs';

async function readAssetDataUrl(fileName: string, mimeType: string) {
  const file = await readFile(path.join(process.cwd(), 'public', fileName));
  return `data:${mimeType};base64,${file.toString('base64')}`;
}

export default async function OpengraphImage() {
  const logoSrc = await readAssetDataUrl(
    'pfalz-development-logo-light.png',
    'image/png'
  );

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        padding: '26px',
        background:
          'radial-gradient(circle at top right, rgba(245, 158, 11, 0.18), transparent 24%), radial-gradient(circle at left center, rgba(120, 53, 15, 0.08), transparent 34%), linear-gradient(180deg, #f7f2e9 0%, #efe5d7 100%)',
        color: '#1f1a17',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          position: 'relative',
          width: '100%',
          height: '100%',
          padding: '42px',
          gap: '28px',
          borderRadius: '34px',
          background:
            'linear-gradient(180deg, rgba(255,251,245,0.9) 0%, rgba(248,243,235,0.86) 100%)',
          border: '1px solid rgba(120, 53, 15, 0.10)',
          boxShadow: '0 26px 80px rgba(41, 37, 36, 0.10)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-56px',
            right: '-24px',
            width: '240px',
            height: '240px',
            borderRadius: '999px',
            background: 'rgba(245, 158, 11, 0.10)',
            filter: 'blur(26px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '-42px',
            bottom: '-82px',
            width: '220px',
            height: '220px',
            borderRadius: '999px',
            background: 'rgba(180, 83, 9, 0.08)',
            filter: 'blur(24px)',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '60%',
            height: '100%',
            padding: '8px 8px 8px 6px',
            color: '#1f1a17',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '22px',
              maxWidth: '610px',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#6b7280',
              }}
            >
              Websites für Unternehmen in der Pfalz
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: '78px',
                  lineHeight: 0.96,
                  fontWeight: 900,
                  letterSpacing: '-0.06em',
                  maxWidth: '560px',
                  color: '#111827',
                }}
              >
                Handgemachte Websites aus der Pfalz.
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: '23px',
                  lineHeight: 1.38,
                  color: '#44403c',
                  maxWidth: '560px',
                }}
              >
                Du willst eine Website, die professionell wirkt und schnell
                verstanden wird?
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '999px',
                  padding: '12px 18px',
                  background: 'rgba(255,255,255,0.66)',
                  border: '1px solid rgba(120, 113, 108, 0.18)',
                  color: '#57534e',
                  fontSize: '17px',
                  fontWeight: 600,
                }}
              >
                Neustadt an der Weinstrasse · Pfalz
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            display: 'flex',
            width: '40%',
            height: '100%',
            padding: '4px 0',
            alignItems: 'stretch',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              position: 'relative',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              padding: '28px 22px',
              borderRadius: '32px',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(245,240,233,0.88) 100%)',
              border: '1px solid rgba(120, 113, 108, 0.14)',
              boxShadow: '0 22px 56px rgba(41,37,36,0.10)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-36px',
                right: '-20px',
                width: '180px',
                height: '180px',
                borderRadius: '999px',
                background: 'rgba(245, 158, 11, 0.12)',
                filter: 'blur(18px)',
              }}
            />
            <img
              src={logoSrc}
              alt="Pfalz Development Logo"
              style={{
                display: 'flex',
                width: '360px',
                height: '202px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 18px 36px rgba(41,37,36,0.16))',
              }}
            />
          </div>
        </div>
      </div>
    </div>,
    size
  );
}
