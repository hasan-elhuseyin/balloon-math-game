'use client'

import React, { useState, useCallback } from 'react'
import { AnimatedBackground } from './AnimatedBackground'
import { StartupMenu } from './StartupMenu'
import { Options } from './Options'
import { GamePlay } from './GamePlay'

export default function BalloonGame() {
  const [showOptions, setShowOptions] = useState(false)
  const [rocketSpeed, setRocketSpeed] = useState(5)
  const [isPlaying, setIsPlaying] = useState(false)

  const startNewLevel = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const handleCreateLevel = useCallback(() => {
    // Logic to handle level creation
    console.log('Creating new level')
  }, [])

  const handleBackToMenu = useCallback(() => {
    setIsPlaying(false)
    setShowOptions(false)
  }, [])

  if (isPlaying) {
    return <GamePlay rocketSpeed={rocketSpeed} onBackToMenu={handleBackToMenu} />
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
          />
        )}
      </div>
    </div>
  )
}

