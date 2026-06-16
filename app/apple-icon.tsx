import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
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
          padding: 10,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#1A1A1A',
            letterSpacing: 3,
            marginBottom: 3,
            display: 'flex',
          }}
        >
          OUR
        </div>

        <div
          style={{
            width: 84,
            height: 112,
            background: '#FFFFFF',
            border: '3.5px solid #1A1A1A',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 3px 8px rgba(0,0,0,0.18)',
          }}
        >
          <div style={{ flex: '0 0 36%', background: '#FAFAF8', borderBottom: '2.5px solid #1A1A1A', display: 'flex' }} />
          <div style={{ height: 5, background: '#1A1A1A', display: 'flex' }} />
          <div
            style={{
              flex: 1,
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: 38, color: '#E11D48', lineHeight: 1, display: 'flex' }}>♥</div>
          </div>
        </div>

        <div
          style={{
            marginTop: 5,
            fontSize: 17,
            fontWeight: 800,
            color: '#1A1A1A',
            letterSpacing: 2,
            display: 'flex',
          }}
        >
          FRIDGE
        </div>
      </div>
    ),
    { ...size }
  )
}
