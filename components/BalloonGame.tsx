'use client'

import React, { useState, useCallback } from 'react'
import { AnimatedBackground } from './AnimatedBackground'
import { StartupMenu } from './StartupMenu'
import { Options } from './Options'
import { GamePlay } from './GamePlay'
import { LevelCreator } from './LevelCreator'
import type { Balloon } from './LevelCreator'

interface CustomLevel {
  name: string
  balloons: Balloon[]
}

export default function BalloonGame() {
  const [showOptions, setShowOptions] = useState(false)
  const [rocketSpeed, setRocketSpeed] = useState(5)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isCreatingLevel, setIsCreatingLevel] = useState(false)
  const [customLevels, setCustomLevels] = useState<CustomLevel[]>([])
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)

  const startNewLevel = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const handleCreateLevel = useCallback(() => {
    setIsCreatingLevel(true)
    setShowOptions(false)
  }, [])

  const handleBackToMenu = useCallback(() => {
    setIsPlaying(false)
    setShowOptions(false)
    setIsCreatingLevel(false)
  }, [])

  const handleSaveLevel = useCallback((name: string, balloons: Balloon[]) => {
    setCustomLevels(prevLevels => {
      // Check if level with same name exists
      const existingLevelIndex = prevLevels.findIndex(level => level.name === name)
      
      if (existingLevelIndex !== -1) {
        // Replace existing level
        const newLevels = [...prevLevels]
        newLevels[existingLevelIndex] = { name, balloons }
        return newLevels
      } else {
        // Add new level
        return [...prevLevels, { name, balloons }]
      }
    })
    setIsCreatingLevel(false)
    setShowOptions(true)
  }, [])

  if (isCreatingLevel) {
    return <LevelCreator 
      onCancel={handleBackToMenu} 
      onSave={handleSaveLevel}
      customLevels={customLevels}
    />
  }

  if (isPlaying) {
    return <GamePlay 
      rocketSpeed={rocketSpeed} 
      onBackToMenu={handleBackToMenu}
      customLevel={customLevels.find(level => level.name === selectedLevel)?.balloons}
    />
  }

  return (
    <div className="relative w-full h-screen">
      <AnimatedBackground />
      <div className="relative z-10 flex items-center justify-center h-full">
        {showOptions ? (
          <Options
            onBack={() => setShowOptions(false)}
            onCreateLevel={handleCreateLevel}
            speed={rocketSpeed}
            onSpeedChange={setRocketSpeed}
          />
        ) : (
          <StartupMenu
            onPlay={startNewLevel}
            onOptions={() => setShowOptions(true)}
            customLevels={customLevels}
            onSelectLevel={setSelectedLevel}
          />
        )}
      </div>
    </div>
  )
}

