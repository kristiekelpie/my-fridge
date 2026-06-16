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
        }}
      >
        {/* Tiny editorial fridge mark */}
        <div
          style={{
            width: 260,
            height: 360,
            background: '#FFFFFF',
            border: '8px solid #1A1A1A',
            borderRadius: 28,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Freezer */}
          <div
            style={{
              flex: '0 0 38%',
              borderBottom: '6px solid #1A1A1A',
              background: '#FAFAF8',
            }}
          />
          {/* Fridge body */}
          <div style={{ flex: 1, background: '#FFFFFF' }} />
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 56,
            fontWeight: 800,
            color: '#1A1A1A',
            letterSpacing: 4,
          }}
        >
          FRIDGE
        </div>
      </div>
    ),
    { ...size }
  )
}
