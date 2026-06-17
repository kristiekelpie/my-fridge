'use client'

import DoorPolaroid, { PolaroidSlot } from './DoorPolaroid'
import DoorNotesPaper from './DoorNotesPaper'
import { MagneticPhrase, HELLO_CHEF_LETTERS, I_LOVE_YOU_LETTERS, I_LOVE_YOU_LETTERS_MOBILE } from './MagneticLetters'
import type { MealNote, ShoppingItem } from '@/lib/types'

interface Props {
  onOpen: () => void
  onOpenNotes: () => void
  notes: MealNote[]
  shopping: ShoppingItem[]
  upperPhotoUrl: string | null
  lowerPhotoUrl: string | null
  leftPhotoUrl: string | null
  rightPhotoUrl: string | null
  onUploadPolaroid: (slot: PolaroidSlot, dataUrl: string) => Promise<void>
  className?: string
}

/** Gloss on freezer + fridge doors only — skips silver handle band */
function FridgeFrontSheen() {
  const panel = { left: '6.4%', width: '87.3%' as const }

  return (
    <>
      <div
        className="absolute z-[5] pointer-events-none overflow-hidden"
        style={{ ...panel, top: '1.9%', height: '27.7%', borderRadius: '10px' }}
        aria-hidden
      >
        <SheenLayers />
      </div>
      <div
        className="absolute z-[5] pointer-events-none overflow-hidden"
        style={{ ...panel, top: '33.1%', height: '60.8%', borderRadius: '10px' }}
        aria-hidden
      >
        <SheenLayers />
      </div>
    </>
  )
}

function SheenLayers() {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.06) 0%,
            transparent 38%,
            rgba(255, 255, 255, 0.22) 54%,
            rgba(255, 255, 255, 0.75) 66%,
            rgba(255, 255, 255, 0.95) 70%,
            rgba(255, 255, 255, 0.75) 74%,
            rgba(255, 255, 255, 0.22) 82%,
            transparent 92%
          )`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            90deg,
            transparent 80%,
            rgba(255, 255, 255, 0.35) 88%,
            rgba(255, 255, 255, 0.55) 93%,
            rgba(255, 255, 255, 0.2) 97%,
            transparent 100%
          )`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.18) 0%,
            transparent 18%,
            transparent 82%,
            rgba(0, 0, 0, 0.03) 100%
          )`,
        }}
      />
    </>
  )
}

export default function FridgeClosed({
  onOpen,
  onOpenNotes,
  notes,
  shopping,
  upperPhotoUrl,
  lowerPhotoUrl,
  leftPhotoUrl,
  rightPhotoUrl,
  onUploadPolaroid,
  className = '',
}: Props) {
  return (
    <div className={`relative mx-auto block w-fit max-w-full pb-4 ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 z-0 -translate-x-1/2 rounded-[50%] bg-stone-900/30 blur-[18px]"
        style={{ bottom: '-0.15rem', width: '82%', height: '1.35rem' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 z-0 -translate-x-1/2 rounded-[50%] bg-stone-900/15 blur-[8px]"
        style={{ bottom: '0.1rem', width: '68%', height: '0.55rem' }}
      />
      <div className="relative z-[1] h-full w-full">
      <svg
        viewBox="0 0 220 520"
        className="h-full w-auto max-w-[96vw] mx-auto pointer-events-none"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="fridgeBody" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#EFEFED" />
            <stop offset="6%" stopColor="#FAFAF8" />
            <stop offset="94%" stopColor="#FAFAF8" />
            <stop offset="100%" stopColor="#ECECEA" />
          </linearGradient>
          <linearGradient id="doorFace" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDFDFB" />
            <stop offset="100%" stopColor="#F6F6F4" />
          </linearGradient>
          <linearGradient id="doorSheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="38%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="54%" stopColor="#FFFFFF" stopOpacity="0.25" />
            <stop offset="66%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="74%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="82%" stopColor="#FFFFFF" stopOpacity="0.25" />
            <stop offset="92%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="edgeSheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="80%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="88%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="93%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="97%" stopColor="#FFFFFF" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="frontShade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.04" />
            <stop offset="35%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="handleSilver" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E4E4E8" />
            <stop offset="45%" stopColor="#B8B8BE" />
            <stop offset="100%" stopColor="#D0D0D6" />
          </linearGradient>
          <linearGradient id="handleBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A8A8AE" />
            <stop offset="100%" stopColor="#888890" />
          </linearGradient>
        </defs>

        {/* Cabinet shell */}
        <rect x="6" y="4" width="208" height="508" rx="12" fill="url(#fridgeBody)" stroke="#B8B8B6" strokeWidth="1.2" />
        <rect x="8" y="6" width="204" height="504" rx="11" fill="#FAFAF8" />

        {/* Freezer door — ~30% */}
        <rect x="14" y="10" width="192" height="144" rx="10" fill="url(#doorFace)" stroke="#D4D4D4" strokeWidth="1" />

        {/* Seam above handle */}
        <rect x="14" y="154" width="192" height="1" fill="#B0B0B6" />
        <rect x="14" y="155" width="192" height="1" fill="#D8D8DE" />

        {/* Fridge door — ~70% */}
        <rect x="14" y="172" width="192" height="316" rx="10" fill="url(#doorFace)" stroke="#D4D4D4" strokeWidth="1" />

        {/* Sheen on freezer + fridge doors only (not handle band) */}
        <rect x="14" y="10" width="192" height="144" rx="10" fill="url(#doorSheen)" />
        <rect x="14" y="10" width="192" height="144" rx="10" fill="url(#edgeSheen)" />
        <rect x="14" y="10" width="192" height="144" rx="10" fill="url(#frontShade)" />
        <rect x="14" y="172" width="192" height="316" rx="10" fill="url(#doorSheen)" />
        <rect x="14" y="172" width="192" height="316" rx="10" fill="url(#edgeSheen)" />
        <rect x="14" y="172" width="192" height="316" rx="10" fill="url(#frontShade)" />

        {/* Silver handle band — on top of sheen */}
        <rect x="14" y="156" width="192" height="14" rx="2" fill="url(#handleSilver)" stroke="#9A9AA0" strokeWidth="0.5" />
        <rect x="72" y="158" width="76" height="3.5" rx="1" fill="url(#handleBar)" />
        <rect x="74" y="159" width="72" height="1.5" rx="0.5" fill="#787880" />
        <rect x="72" y="163" width="76" height="3.5" rx="1" fill="url(#handleBar)" />
        <rect x="74" y="164" width="72" height="1.5" rx="0.5" fill="#787880" />
        <rect x="14" y="170" width="192" height="1" fill="#C8C8CE" />

        {/* Kickplate grille */}
        <rect x="14" y="490" width="192" height="18" rx="3" fill="#F0F0EE" stroke="#D8D8D6" strokeWidth="0.5" />
        <line x1="28" y1="495" x2="192" y2="495" stroke="#E0E0DE" strokeWidth="0.5" />
        <line x1="28" y1="499" x2="192" y2="499" stroke="#E0E0DE" strokeWidth="0.5" />
        <line x1="28" y1="503" x2="192" y2="503" stroke="#E0E0DE" strokeWidth="0.5" />

        {/* Leveling feet */}
        <rect x="22" y="508" width="8" height="3" rx="0.5" fill="#222" />
        <rect x="190" y="508" width="8" height="3" rx="0.5" fill="#222" />

        {/* Ground shadow */}
        <ellipse cx="110" cy="517" rx="92" ry="7" fill="#000" opacity="0.14" />
      </svg>

      <FridgeFrontSheen />

      {/* Freezer door exterior */}
      <div
        className="absolute z-10"
        style={{ top: '1.9%', left: '6.4%', width: '87.3%', height: '27.7%' }}
      >
        <button
          type="button"
          onClick={onOpen}
          className="absolute inset-0 z-0 cursor-pointer rounded-lg"
          aria-label="Open fridge"
        />
        <DoorPolaroid
          slot="upper"
          photoUrl={upperPhotoUrl}
          onUpload={onUploadPolaroid}
          magnetCorner="top-quarter"
          size="sm"
          className="!z-10"
          style={{ top: '18%', left: '28%', transform: 'rotate(-3deg) scale(1.1)' }}
        />
        <MagneticPhrase
          letters={HELLO_CHEF_LETTERS}
          className="translate-x-[2px] translate-y-[14px] !z-[25]"
        />
      </div>

      {/* Handle tap → open */}
      <button
        type="button"
        onClick={onOpen}
        className="absolute z-10 cursor-pointer"
        style={{ top: '30%', left: '6.4%', width: '87.3%', height: '2.7%' }}
        aria-label="Open fridge"
      />

      {/* Fridge door exterior */}
      <div
        className="absolute z-10"
        style={{ top: '33.1%', left: '6.4%', width: '87.3%', height: '60.8%' }}
      >
        {/* Background tap → open interior */}
        <button
          type="button"
          onClick={onOpen}
          className="absolute inset-0 z-0 cursor-pointer rounded-lg"
          aria-label="Open fridge door"
        />

        {/* Upper-left polaroid */}
        <DoorPolaroid
          slot="left"
          photoUrl={leftPhotoUrl}
          onUpload={onUploadPolaroid}
          magnetCorner="top-left"
          magnetStyle={{ transform: 'translateX(0.7rem)' }}
          size="sm"
          style={{ top: '8%', left: '9%', transform: 'rotate(-5deg) scale(1.1)' }}
        />

        {/* Lined notes paper — top right */}
        <DoorNotesPaper
          onClick={onOpenNotes}
          notes={notes}
          shopping={shopping}
          className="top-[15%] sm:top-[10%] left-[52%] scale-[0.924] sm:scale-[1.038] origin-top-left -rotate-6"
        />

        {/* Bottom row — two polaroids */}
        <DoorPolaroid
          slot="lower"
          photoUrl={lowerPhotoUrl}
          onUpload={onUploadPolaroid}
          magnetCorner="top-left"
          magnetStyle={{ transform: 'translateX(0.8rem)' }}
          size="sm"
          className="!z-10"
          style={{ top: '43%', left: '10%', transform: 'rotate(4deg) scale(1.1)' }}
        />
        <DoorPolaroid
          slot="right"
          photoUrl={rightPhotoUrl}
          onUpload={onUploadPolaroid}
          magnetCorner="top-right"
          size="sm"
          className="!z-10 max-sm:!top-[59%]"
          style={{ top: '53%', left: '58%', transform: 'rotate(-4deg) scale(1.1)' }}
        />
        <MagneticPhrase letters={I_LOVE_YOU_LETTERS} className="hidden sm:block !z-[25]" />
        <MagneticPhrase letters={I_LOVE_YOU_LETTERS_MOBILE} className="sm:hidden !z-[25]" />
      </div>
      </div>
    </div>
  )
}
