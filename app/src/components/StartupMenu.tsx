import React, { useState } from 'react'
import { Button } from '@/app/src/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/src/components/ui/select'

interface StartupMenuProps {
  onPlay: () => void
  onOptions: () => void
  customLevels: Array<{
    name: string
    balloons: Array<{
      x: number
      y: number
      type: string
    }>
  }>
  onSelectLevel: (level: string | null) => void
}

export function StartupMenu({ onPlay, onOptions, customLevels, onSelectLevel }: StartupMenuProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>('default')

  const handlePlay = () => {
    onSelectLevel(selectedLevel === 'default' ? null : selectedLevel)
    onPlay()
  }

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 z-10">
      <h1 className="text-4xl font-bold mb-6">Balloon Math Game</h1>
      
      <Select value={selectedLevel} onValueChange={setSelectedLevel}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Select level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default Level</SelectItem>
          {customLevels.map(level => (
            <SelectItem key={level.name} value={level.name}>
              {level.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={handlePlay} className="w-40">Play</Button>
      <Button onClick={onOptions} variant="outline" className="w-40">Options</Button>
    </div>
  )
}

