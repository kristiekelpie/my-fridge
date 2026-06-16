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
        }}
      >
        <div
          style={{
            width: 96,
            height: 130,
            background: '#FFFFFF',
            border: '4px solid #1A1A1A',
            borderRadius: 14,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ flex: '0 0 38%', borderBottom: '3px solid #1A1A1A', background: '#FAFAF8' }} />
          <div style={{ flex: 1, background: '#FFFFFF' }} />
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 20,
            fontWeight: 800,
            color: '#1A1A1A',
            letterSpacing: 2,
          }}
        >
          FRIDGE
        </div>
      </div>
    ),
    { ...size }
  )
}
