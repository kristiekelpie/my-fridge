import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#E8E4D7',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          padding: 28,
        }}
      >
        {/* "OUR" eyebrow */}
        <div
          style={{
            fontSize: 38,
            fontWeight: 700,
            color: '#1A1A1A',
            letterSpacing: 8,
            marginBottom: 10,
          }}
        >
          OUR
        </div>

        {/* Fridge with heart */}
        <div
          style={{
            position: 'relative',
            width: 240,
            height: 320,
            background: '#FFFFFF',
            border: '8px solid #1A1A1A',
            borderRadius: 26,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 8px 22px rgba(0,0,0,0.18)',
          }}
        >
          {/* Freezer compartment */}
          <div
            style={{
              flex: '0 0 36%',
              background: '#FAFAF8',
              borderBottom: '6px solid #1A1A1A',
              display: 'flex',
            }}
          />
          {/* Handle band */}
          <div
            style={{
              height: 14,
              background: '#1A1A1A',
              display: 'flex',
            }}
          />
          {/* Fridge body */}
          <div
            style={{
              flex: 1,
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Heart (CSS) */}
            <div
              style={{
                fontSize: 110,
                color: '#E11D48',
                lineHeight: 1,
                display: 'flex',
              }}
            >
              ♥
            </div>
          </div>
        </div>

        {/* "FRIDGE" caption */}
        <div
          style={{
            marginTop: 16,
            fontSize: 50,
            fontWeight: 800,
            color: '#1A1A1A',
            letterSpacing: 6,
          }}
        >
          FRIDGE
        </div>
      </div>
    ),
    { ...size }
  )
}
