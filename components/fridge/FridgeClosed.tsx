'use client'

import DoorPolaroid, { PolaroidSlot } from './DoorPolaroid'
import DoorNotesPaper from './DoorNotesPaper'

interface Props {
  onOpen: () => void
  onOpenNotes: () => void
  upperPhotoUrl: string | null
  lowerPhotoUrl: string | null
  leftPhotoUrl: string | null
  onUploadPolaroid: (slot: PolaroidSlot, file: File) => Promise<void>
  className?: string
}

export default function FridgeClosed({
  onOpen,
  onOpenNotes,
  upperPhotoUrl,
  lowerPhotoUrl,
  leftPhotoUrl,
  onUploadPolaroid,
  className = '',
}: Props) {
  return (
    <div
      className={`relative mx-auto block ${className}`}
      style={{ filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.12))' }}
    >
      <svg
        viewBox="0 0 220 520"
        className="h-full w-auto max-w-[96vw] mx-auto pointer-events-none"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="6" y="6" width="208" height="508" rx="14" fill="#FAFAF8" stroke="#A8A8A8" strokeWidth="1.5" />
        <rect x="8" y="8" width="204" height="504" rx="13" fill="#FFFFFF" />

        {/* Freezer */}
        <rect x="14" y="14" width="192" height="172" rx="10" fill="#FFFFFF" stroke="#D4D4D4" strokeWidth="1" />
        <line x1="22" y1="22" x2="200" y2="22" stroke="#EEEEEE" strokeWidth="1" />
        <rect x="158" y="32" width="38" height="10" rx="2" fill="#F3F3F3" stroke="#E0E0E0" strokeWidth="0.5" />
        <text x="177" y="40" fontSize="6" fill="#9CA3AF" fontFamily="var(--font-mono), monospace" textAnchor="middle" letterSpacing="1">
          cooler
        </text>

        {/* Handle band */}
        <rect x="14" y="190" width="192" height="20" rx="2" fill="#C0C0C0" />
        <rect x="14" y="190" width="192" height="3" fill="#A0A0A0" />
        <rect x="74" y="194" width="72" height="5" rx="2.5" fill="#888" />
        <rect x="76" y="195" width="68" height="2" rx="1" fill="#BBB" />
        <rect x="74" y="202" width="72" height="5" rx="2.5" fill="#888" />
        <rect x="76" y="203" width="68" height="2" rx="1" fill="#BBB" />

        {/* Fridge door */}
        <rect x="14" y="214" width="192" height="268" rx="10" fill="#FCFCFC" stroke="#D4D4D4" strokeWidth="1" />
        <rect x="20" y="220" width="8" height="256" rx="4" fill="#FFFFFF" opacity="0.6" />

        {/* Kickplate */}
        <rect x="14" y="486" width="192" height="22" rx="3" fill="#E8E8E8" />
        <line x1="30" y1="494" x2="190" y2="494" stroke="#D0D0D0" strokeWidth="0.5" />
        <line x1="30" y1="500" x2="190" y2="500" stroke="#D0D0D0" strokeWidth="0.5" />
        <rect x="22" y="508" width="10" height="5" rx="1" fill="#E8E8E8" stroke="#A8A8A8" strokeWidth="0.5" />
        <rect x="188" y="508" width="10" height="5" rx="1" fill="#E8E8E8" stroke="#A8A8A8" strokeWidth="0.5" />
      </svg>

      {/* Freezer door exterior */}
      <div
        className="absolute z-10"
        style={{ top: '2.7%', left: '6.4%', width: '87.3%', height: '33%' }}
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
      </div>

      {/* Handle tap → open */}
      <button
        type="button"
        onClick={onOpen}
        className="absolute z-10 cursor-pointer"
        style={{ top: '36.5%', left: '6.4%', width: '87.3%', height: '3.8%' }}
        aria-label="Open fridge"
      />

      {/* Fridge door exterior */}
      <div
        className="absolute z-10"
        style={{ top: '41.2%', left: '6.4%', width: '87.3%', height: '51.5%' }}
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
          style={{ top: '18%', left: '58%', transform: 'rotate(-6deg)' }}
        />

        {/* Lower polaroid on fridge door */}
        <DoorPolaroid
          slot="lower"
          photoUrl={lowerPhotoUrl}
          onUpload={onUploadPolaroid}
          magnetCorner="top-right"
          style={{ top: '52%', left: '50%', transform: 'translateX(-50%) rotate(4deg)' }}
        />
      </div>
    </div>
  )
}
