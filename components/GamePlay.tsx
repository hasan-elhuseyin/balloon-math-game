'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { compile } from 'mathjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Balloon {
  x: number
  y: number
  type: 'red' | 'green' | 'blue'
}

interface GamePlayProps {
  rocketSpeed: number
  onBackToMenu: () => void
}

const ROCKET_HITBOX_SIZE = 40

const balloonEmojis = {
  red: '🎈',
  green: '🟢',
  blue: '🔵',
}

export function GamePlay({ rocketSpeed, onBackToMenu }: GamePlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const [balloons, setBalloons] = useState<Balloon[]>([])
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [formula, setFormula] = useState('')
  const [rocketPosition, setRocketPosition] = useState<{ x: number; y: number } | null>(null)
  const [rocketTrack, setRocketTrack] = useState<{ x: number; y: number }[]>([])
  const [rocketsUsed, setRocketsUsed] = useState(0)
  const [score, setScore] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight * 0.9
      setCanvasSize({ width, height })
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (canvasSize.width === 0 || canvasSize.height === 0) return

    const newBalloons: Balloon[] = Array.from({ length: 10 }, () => ({
      x: Math.random() * canvasSize.width,
      y: Math.random() * (canvasSize.height * 0.8),
      type: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'blue' : 'green') : 'red'
    }))

    setBalloons(newBalloons)
    setRocketsUsed(0)
    setRocketTrack([])
  }, [canvasSize])

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)

    // Draw axes
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, canvasSize.height / 2)
    ctx.lineTo(canvasSize.width, canvasSize.height / 2)
    ctx.moveTo(canvasSize.width / 2, 0)
    ctx.lineTo(canvasSize.width / 2, canvasSize.height)
    ctx.stroke()

    // Draw balloons
    balloons.forEach(balloon => {
      ctx.font = '30px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(balloonEmojis[balloon.type], balloon.x, balloon.y)
    })

    // Draw rocket
    if (rocketPosition) {
      ctx.font = '30px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('🚀', rocketPosition.x, rocketPosition.y)
    }

    // Draw rocket track
    if (rocketTrack.length > 1) {
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(rocketTrack[0].x, rocketTrack[0].y)
      for (let i = 1; i < rocketTrack.length; i++) {
        ctx.lineTo(rocketTrack[i].x, rocketTrack[i].y)
      }
      ctx.stroke()
    }
  }, [canvasSize, balloons, rocketPosition, rocketTrack])

  useEffect(() => {
    drawGame()
  }, [drawGame])

  const handleFormulaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isAnimating) return

    if (formula.trim() === '') {
      alert('Please enter a formula before shooting.')
      return
    }

    setRocketsUsed(prev => prev + 1)
    setRocketTrack([])
    setIsAnimating(true)

    try {
      const compiledFormula = compile(formula)
      const rocketX = -canvasSize.width / 2
      const rocketY = compiledFormula.evaluate({ x: rocketX })
      const initialPosition = { x: rocketX + canvasSize.width / 2, y: canvasSize.height / 2 - rocketY }
      setRocketPosition(initialPosition)
      setRocketTrack([initialPosition])

      let currentX = initialPosition.x

      const animate = () => {
        currentX += rocketSpeed
        const newY = canvasSize.height / 2 - compiledFormula.evaluate({ x: currentX - canvasSize.width / 2 })
        const newPosition = { x: currentX, y: newY }

        setRocketPosition(newPosition)
        setRocketTrack(prevTrack => [...prevTrack, newPosition])

        // Check for collisions
        setBalloons(prevBalloons => {
          const newBalloons = prevBalloons.map(balloon => {
            if (Math.sqrt((balloon.x - newPosition.x) ** 2 + (balloon.y - newPosition.y) ** 2) <= ROCKET_HITBOX_SIZE) {
              if (balloon.type === 'blue') {
                return { ...balloon, type: 'green' }
              } else if (balloon.type === 'green') {
                return { ...balloon, type: 'red' }
              } else {
                return null // Remove red balloons when hit
              }
            }
            return balloon
          }).filter((balloon): balloon is Balloon => balloon !== null)

          if (newBalloons.length === 0) {
            const levelScore = Math.max(100 - rocketsUsed * 10, 10)
            setScore(prev => prev + levelScore)
            alert(`Level completed! Score: ${levelScore}`)
            setIsAnimating(false)
            return newBalloons
          }
          return newBalloons
        })

        if (currentX > canvasSize.width) {
          setIsAnimating(false)
          return
        }

        animationRef.current = requestAnimationFrame(animate)
      }

      animate()
    } catch (error) {
      console.error('Invalid formula:', error)
      alert('Invalid formula. Please try again.')
      setIsAnimating(false)
    }
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100 relative">
      <div className="absolute top-4 left-4 text-lg font-bold">Rockets Used: {rocketsUsed}</div>
      <div className="mb-4 text-lg font-bold">
        Score: {score}
      </div>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="border border-gray-300 shadow-lg"
      />
      <form onSubmit={handleFormulaSubmit} className="mt-4 flex items-center">
        <label htmlFor="formula" className="mr-2 font-bold">
          y =
        </label>
        <Input
          type="text"
          id="formula"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          className="mr-2"
          placeholder="Enter your formula"
          disabled={isAnimating}
        />
        <Button type="submit" disabled={isAnimating}>
          {isAnimating ? 'Shooting...' : 'Shoot'}
        </Button>
      </form>
      <Button onClick={onBackToMenu} className="mt-4" disabled={isAnimating}>Back to Menu</Button>
    </div>
  )
}

