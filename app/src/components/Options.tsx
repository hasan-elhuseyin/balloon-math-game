import React from 'react'
import { Button } from '@/app/src/components/ui/button'
import { Slider } from '@/app/src/components/ui/slider'

interface OptionsProps {
  onBack: () => void
  onCreateLevel: () => void
  speed: number
  onSpeedChange: (value: number) => void
}

export function Options({ onBack, onCreateLevel, speed, onSpeedChange }: OptionsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 z-10">
      <h2 className="text-2xl font-bold mb-4">Options</h2>
      <div className="flex items-center space-x-4">
        <span>Graph Speed:</span>
        <Slider
          min={1}
          max={10}
          step={1}
          value={[speed]}
          onValueChange={(value) => onSpeedChange(value[0])}
          className="w-64"
        />
        <span>{speed}</span>
      </div>
      <Button onClick={onCreateLevel} className="w-40">Create New Level</Button>
      <Button onClick={onBack} variant="outline" className="w-40">Back to Menu</Button>
    </div>
  )
}

