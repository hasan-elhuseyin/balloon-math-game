'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { compile } from 'mathjs'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "./ui/dialog"
import { Balloon, BalloonEmojis } from '../models/BalloonManager'

interface GamePlayProps {
  rocketSpeed: number
  onBackToMenu: () => void
  customLevel?: Array<{
    x: number
    y: number
    type: string
  }>
}

const ROCKET_HITBOX_SIZE = 40

const COORD_MIN = -10
const COORD_MAX = 10

export function GamePlay({ rocketSpeed, onBackToMenu, customLevel }: GamePlayProps) {
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
  const [isGameComplete, setIsGameComplete] = useState(false)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [levelScore, setLevelScore] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      const headerHeight = 64  // 4rem (p-4) * 2
      const footerHeight = 64
      const width = window.innerWidth
      const height = window.innerHeight - (headerHeight + footerHeight)
      setCanvasSize({ width, height })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (canvasSize.width === 0 || canvasSize.height === 0) return

    if (customLevel) {
      // Use the saved mathematical coordinates directly
      const xStep = canvasSize.width / (COORD_MAX - COORD_MIN)
      const yStep = canvasSize.height / (COORD_MAX - COORD_MIN)
      
      setBalloons(customLevel.map(balloon => ({
        // Store both canvas and math coordinates
        x: (canvasSize.width / 2) + (balloon.x * xStep),
        y: (canvasSize.height / 2) - (balloon.y * yStep),
        mathX: balloon.x,  // Store original math coordinates
        mathY: balloon.y,
        type: balloon.type as 'red' | 'green' | 'blue'
      })))
    } else {
      // Generate random balloons within coordinate bounds
      const xStep = canvasSize.width / (COORD_MAX - COORD_MIN)
      const yStep = canvasSize.height / (COORD_MAX - COORD_MIN)
      
      const newBalloons: Balloon[] = Array.from({ length: 10 }, () => {
        const mathX = Math.floor(Math.random() * (COORD_MAX - COORD_MIN + 1)) + COORD_MIN
        const mathY = Math.floor(Math.random() * (COORD_MAX - COORD_MIN + 1)) + COORD_MIN
        return {
          x: (canvasSize.width / 2) + (mathX * xStep),
          y: (canvasSize.height / 2) - (mathY * yStep),
          mathX,
          mathY,
          type: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'blue' : 'green') : 'red'
        }
      })
      setBalloons(newBalloons)
    }

    setRocketsUsed(0)
    setRocketTrack([])
  }, [canvasSize, customLevel])

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)

    // Draw axes
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    ctx.font = '14px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Draw X axis
    ctx.beginPath()
    ctx.moveTo(0, canvasSize.height / 2)
    ctx.lineTo(canvasSize.width, canvasSize.height / 2)
    ctx.stroke()

    // Draw Y axis
    ctx.beginPath()
    ctx.moveTo(canvasSize.width / 2, 0)
    ctx.lineTo(canvasSize.width / 2, canvasSize.height)
    ctx.stroke()

    // Draw X axis labels
    const xStep = canvasSize.width / 20
    for (let x = -10; x <= 10; x++) {
      const xPos = canvasSize.width / 2 + x * xStep
      ctx.fillText(x.toString(), xPos, canvasSize.height / 2 + 20)
      
      // Draw tick marks
      ctx.beginPath()
      ctx.moveTo(xPos, canvasSize.height / 2 - 5)
      ctx.lineTo(xPos, canvasSize.height / 2 + 5)
      ctx.stroke()
    }

    // Draw Y axis labels
    const yStep = canvasSize.height / 20
    for (let y = -10; y <= 10; y++) {
      const yPos = canvasSize.height / 2 - y * yStep
      ctx.fillText(y.toString(), canvasSize.width / 2 - 20, yPos)
      
      // Draw tick marks
      ctx.beginPath()
      ctx.moveTo(canvasSize.width / 2 - 5, yPos)
      ctx.lineTo(canvasSize.width / 2 + 5, yPos)
      ctx.stroke()
    }

    // Draw balloons
    balloons.forEach(balloon => {
      ctx.font = '30px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(BalloonEmojis[balloon.type], balloon.x, balloon.y)
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
    if (isAnimating || isGameComplete) return

    if (formula.trim() === '') {
      alert('Please enter a formula before shooting.')
      return
    }

    setRocketsUsed(prev => prev + 1)
    setRocketTrack([])
    setIsAnimating(true)

    try {
      const compiledFormula = compile(formula)
      const xStep = canvasSize.width / 20
      const yStep = canvasSize.height / 20

      // Convert from canvas to math coordinates for initial position
      const rocketX = -10  // Start from leftmost position (-10)
      const rocketY = compiledFormula.evaluate({ x: rocketX })
      
      // Convert from math to canvas coordinates
      const initialPosition = {
        x: canvasSize.width / 2 + (rocketX * xStep),
        y: canvasSize.height / 2 - (rocketY * yStep)
      }

      setRocketPosition(initialPosition)
      setRocketTrack([initialPosition])

      let currentX = rocketX

      const animate = () => {
        if (isGameComplete) {
          cleanupAnimation()
          return
        }

        currentX += (20 / (canvasSize.width / rocketSpeed))  // Scale speed to coordinate system
        const mathY = compiledFormula.evaluate({ x: currentX })
        const newPosition = {
          x: canvasSize.width / 2 + (currentX * xStep),
          y: canvasSize.height / 2 - (mathY * yStep)
        }

        setRocketPosition(newPosition)
        setRocketTrack(prevTrack => [...prevTrack, newPosition])

        // Check for collisions only once per position
        const hitBalloon = balloons.find(balloon => 
          Math.sqrt((balloon.x - newPosition.x) ** 2 + (balloon.y - newPosition.y) ** 2) <= ROCKET_HITBOX_SIZE
        )

        if (hitBalloon) {
          setBalloons(prevBalloons => {
            const newBalloons = prevBalloons.map(balloon => {
              if (balloon === hitBalloon) {
                if (balloon.type === 'blue') {
                  return { ...balloon, type: 'green' }
                }
                if (balloon.type === 'green') {
                  return { ...balloon, type: 'red' }
                }
                if (balloon.type === 'red') {
                  return null
                }
              }
              return balloon
            }).filter((balloon): balloon is Balloon => balloon !== null)

            if (newBalloons.length === 0 && !isGameComplete) {
              handleLevelComplete()
            }
            return newBalloons
          })
        }

        if (currentX > 10) {  // Stop at rightmost position (+10)
          cleanupAnimation()
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

  const cleanupAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    setIsAnimating(false)
  }, [])

  const handleLevelComplete = () => {
    setIsGameComplete(true)
    cleanupAnimation()
    const score = Math.max(100 - rocketsUsed * 10, 10)
    setLevelScore(score)
    setScore(prev => prev + score)
    setShowCompletionDialog(true)
  }

  const handlePlayAgain = () => {
    setShowCompletionDialog(false)
    setIsGameComplete(false)
    setIsAnimating(false)
    setRocketTrack([])
    setRocketPosition(null)
    setRocketsUsed(0)
    // Reset balloons to initial state
    if (customLevel) {
      const xStep = canvasSize.width / (COORD_MAX - COORD_MIN)
      const yStep = canvasSize.height / (COORD_MAX - COORD_MIN)
      
      setBalloons(customLevel.map(balloon => ({
        x: (canvasSize.width / 2) + (balloon.x * xStep),
        y: (canvasSize.height / 2) - (balloon.y * yStep),
        mathX: balloon.x,
        mathY: balloon.y,
        type: balloon.type as 'red' | 'green' | 'blue'
      })))
    }
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100 overflow-hidden">
      <header className="w-full h-16 p-4 border-b bg-white shadow-sm flex justify-between items-center">
        <div className="text-lg font-bold">
          Rockets Used: {rocketsUsed}
        </div>
        <div className="text-lg font-bold">
          Score: {score}
        </div>
        <Button onClick={onBackToMenu} variant="outline">
          Back to Menu
        </Button>
      </header>

      <main className="flex-1 flex items-center justify-center min-h-0">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="border border-gray-300 shadow-lg"
        />
      </main>

      <footer className="w-full h-16 p-4 border-t bg-white shadow-sm">
        <form onSubmit={handleFormulaSubmit} className="flex items-center justify-center gap-2">
          <label htmlFor="formula" className="font-bold">
            y =
          </label>
          <Input
            type="text"
            id="formula"
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            className="max-w-xs"
            placeholder="Enter your formula"
            disabled={isAnimating}
          />
          <Button type="submit" disabled={isAnimating}>
            {isAnimating ? 'Shooting...' : 'Shoot'}
          </Button>
        </form>
      </footer>

      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent>
          <DialogTitle>Level Complete!</DialogTitle>
          <div className="py-4">
            <p>Congratulations! You completed the level!</p>
            <p className="font-bold">Score: {levelScore}</p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button onClick={handlePlayAgain}>
              Play Again
            </Button>
            <Button variant="outline" onClick={onBackToMenu}>
              Back to Menu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

