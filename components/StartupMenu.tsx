import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface StartupMenuProps {
  onPlay: () => void
  onOptions: () => void
}

export function StartupMenu({ onPlay, onOptions }: StartupMenuProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 z-10">
      <h1 className="text-4xl font-bold mb-6">Balloon Math Game</h1>
      <Button onClick={onPlay} className="w-40">Play</Button>
      <Button onClick={onOptions} variant="outline" className="w-40">Options</Button>
    </div>
  )
}

