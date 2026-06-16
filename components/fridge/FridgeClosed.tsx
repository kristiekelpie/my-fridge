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
  onUploadPolaroid: (slot: PolaroidSlot, file: File) => Promise<void>
  className?: string
}

export default function FridgeClosed({
  onOpen,
  onOpenNotes,
  notes,
  shopping,
  upperPhotoUrl,
  lowerPhotoUrl,
  leftPhotoUrl,
  onUploadPolaroid,
  className = '',
}: Props) {
  return (
    <div
      className={`relative mx-auto block w-fit max-w-full ${className}`}
      style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.08))' }}
    >
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
            <stop offset="52%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="64%" stopColor="#FFFFFF" stopOpacity="0.18" />
            <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="76%" stopColor="#FFFFFF" stopOpacity="0.18" />
            <stop offset="88%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="edgeSheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="86%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="92%" stopColor="#FFFFFF" stopOpacity="0.22" />
            <stop offset="96%" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Cabinet shell */}
        <rect x="6" y="4" width="208" height="508" rx="12" fill="url(#fridgeBody)" stroke="#B8B8B6" strokeWidth="1.2" />
        <rect x="8" y="6" width="204" height="504" rx="11" fill="#FAFAF8" />

        {/* Freezer door — ~30% */}
        <rect x="14" y="10" width="192" height="144" rx="10" fill="url(#doorFace)" stroke="#D4D4D4" strokeWidth="1" />
        <rect x="14" y="10" width="192" height="144" rx="10" fill="url(#doorSheen)" />
        <rect x="14" y="10" width="192" height="144" rx="10" fill="url(#edgeSheen)" />

        {/* Door seam */}
        <rect x="14" y="154" width="192" height="1" fill="#D6D6D4" />
        <rect x="14" y="155" width="192" height="1" fill="#F0F0EE" />

        {/* Recessed handle pocket between doors */}
        <rect x="14" y="156" width="192" height="14" rx="2" fill="#EBEBE9" stroke="#D8D8D6" strokeWidth="0.5" />
        <rect x="72" y="158" width="76" height="3.5" rx="1" fill="#D0D0CE" />
        <rect x="74" y="159" width="72" height="1.5" rx="0.5" fill="#C4C4C2" />
        <rect x="72" y="163" width="76" height="3.5" rx="1" fill="#D0D0CE" />
        <rect x="74" y="164" width="72" height="1.5" rx="0.5" fill="#C4C4C2" />

        <rect x="14" y="170" width="192" height="1" fill="#D6D6D4" />

        {/* Fridge door — ~70% */}
        <rect x="14" y="172" width="192" height="316" rx="10" fill="url(#doorFace)" stroke="#D4D4D4" strokeWidth="1" />
        <rect x="14" y="172" width="192" height="316" rx="10" fill="url(#doorSheen)" />
        <rect x="14" y="172" width="192" height="316" rx="10" fill="url(#edgeSheen)" />

        {/* Kickplate grille */}
        <rect x="14" y="490" width="192" height="18" rx="3" fill="#F0F0EE" stroke="#D8D8D6" strokeWidth="0.5" />
        <line x1="28" y1="495" x2="192" y2="495" stroke="#E0E0DE" strokeWidth="0.5" />
        <line x1="28" y1="499" x2="192" y2="499" stroke="#E0E0DE" strokeWidth="0.5" />
        <line x1="28" y1="503" x2="192" y2="503" stroke="#E0E0DE" strokeWidth="0.5" />

        {/* Leveling feet */}
        <rect x="22" y="508" width="8" height="3" rx="0.5" fill="#222" />
        <rect x="190" y="508" width="8" height="3" rx="0.5" fill="#222" />
      </svg>

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
          style={{ top: '22%', left: '50%', transform: 'translateX(-50%) rotate(-3deg)' }}
        />
        <MagneticPhrase letters={HELLO_CHEF_LETTERS} className="translate-x-[5px] translate-y-[20px]" />
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

        {/* Upper-left polaroid on fridge door */}
        <DoorPolaroid
          slot="left"
          photoUrl={leftPhotoUrl}
          onUpload={onUploadPolaroid}
          magnetCorner="top-left"
          style={{ top: '14%', left: '14%', transform: 'rotate(-5deg)' }}
        />

        {/* Lined notes paper */}
        <DoorNotesPaper
          onClick={onOpenNotes}
          notes={notes}
          shopping={shopping}
          className="top-[16%] left-[60%] sm:left-[52%] -rotate-6"
        />

        {/* Lower polaroid on fridge door */}
        <DoorPolaroid
          slot="lower"
          photoUrl={lowerPhotoUrl}
          onUpload={onUploadPolaroid}
          magnetCorner="top-right"
          style={{ top: '52%', left: '50%', transform: 'translateX(-50%) rotate(4deg)' }}
        />
        <MagneticPhrase letters={I_LOVE_YOU_LETTERS} className="hidden sm:block" />
        <MagneticPhrase letters={I_LOVE_YOU_LETTERS_MOBILE} className="sm:hidden" />
      </div>
    </div>
  )
}
