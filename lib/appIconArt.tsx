/** Shared fridge-card icon art for PWA / apple / favicon routes. */

type Props = { scale: number }

const HEART_PATH =
  'M50,85 C20,60 5,45 5,28 C5,15 15,8 25,8 C32,8 38,12 50,25 C62,12 68,8 75,8 C85,8 95,15 95,28 C95,45 80,60 50,85 Z'

function Heart3D({ size }: { size: number }) {
  const w = size
  const h = size * 0.88

  return (
    <svg width={w} height={h} viewBox="0 0 100 90" style={{ display: 'flex' }}>
      <defs>
        <linearGradient id="heartBody" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#FCA5A5" />
          <stop offset="35%" stopColor="#EF4444" />
          <stop offset="70%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
        <linearGradient id="heartRim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FECACA" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#B91C1C" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id="heartSpecular" cx="30%" cy="22%" r="45%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path d={HEART_PATH} fill="url(#heartBody)" />
      <path
        d={HEART_PATH}
        fill="none"
        stroke="url(#heartRim)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <ellipse cx="28" cy="26" rx="14" ry="11" fill="url(#heartSpecular)" />
      <ellipse cx="62" cy="30" rx="7" ry="5" fill="#FFFFFF" opacity="0.35" />
    </svg>
  )
}

export function AppIconArt({ scale }: Props) {
  const sx = (n: number) => n * scale
  const cardW = sx(380)
  const cardH = sx(480)
  const border = sx(10)
  const radius = sx(44)
  const inset = sx(22)
  const panelH = sx(148)
  const thinH = sx(3)
  const bandH = sx(30)
  const heartSize = sx(108)

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(145deg, #EDE9DC 0%, #D4CFC0 55%, #C8C2B2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: sx(420),
          height: sx(520),
          borderRadius: sx(56),
          background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.35) 0%, transparent 70%)',
          display: 'flex',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: cardW,
          height: cardH,
          display: 'flex',
          boxShadow: `0 ${sx(18)}px ${sx(44)}px rgba(0,0,0,0.24), 0 ${sx(6)}px ${sx(14)}px rgba(0,0,0,0.12)`,
          borderRadius: radius,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(165deg, #FFFFFF 0%, #F7F7F5 38%, #ECECEA 100%)',
            border: `${border}px solid #1A1A1A`,
            borderRadius: radius,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: `inset 0 ${sx(2)}px ${sx(1)}px rgba(255,255,255,0.95), inset 0 -${sx(3)}px ${sx(8)}px rgba(0,0,0,0.06)`,
          }}
        >
          <div
            style={{
              margin: inset,
              marginBottom: 0,
              height: panelH,
              background: 'linear-gradient(180deg, #FCFCFA 0%, #F0F0EE 55%, #E6E6E4 100%)',
              borderRadius: sx(20),
              border: `${sx(2)}px solid #D8D8D6`,
              display: 'flex',
              boxShadow: `inset 0 ${sx(3)}px ${sx(10)}px rgba(255,255,255,0.95), inset 0 -${sx(2)}px ${sx(6)}px rgba(0,0,0,0.05)`,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: sx(8),
                left: sx(12),
                right: sx(12),
                height: sx(8),
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.85) 50%, transparent 100%)',
                borderRadius: sx(4),
                display: 'flex',
              }}
            />
          </div>

          <div
            style={{
              marginTop: sx(14),
              marginLeft: inset,
              marginRight: inset,
              height: thinH,
              background: 'linear-gradient(180deg, #D1D5DB 0%, #9CA3AF 100%)',
              borderRadius: sx(1),
              display: 'flex',
            }}
          />

          <div
            style={{
              marginTop: sx(5),
              height: bandH,
              background: 'linear-gradient(180deg, #F3F4F6 0%, #D1D5DB 28%, #9CA3AF 58%, #6B7280 100%)',
              display: 'flex',
              boxShadow: `0 ${sx(2)}px ${sx(5)}px rgba(0,0,0,0.14), inset 0 ${sx(2)}px 0 rgba(255,255,255,0.65), inset 0 -${sx(1)}px 0 rgba(0,0,0,0.12)`,
            }}
          />

          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F9F9F7 100%)',
            }}
          >
            <Heart3D size={heartSize} />
          </div>

          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(128deg, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.18) 24%, transparent 46%, transparent 100%)',
              display: 'flex',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: sx(24),
              left: sx(52),
              width: sx(28),
              height: '72%',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 55%, transparent 100%)',
              borderRadius: sx(14),
              display: 'flex',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: sx(14),
              left: sx(28),
              right: sx(28),
              height: sx(5),
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
              borderRadius: sx(3),
              display: 'flex',
            }}
          />
        </div>
      </div>
    </div>
  )
}
