'use client'

import React, { useRef, useEffect, useState } from 'react'
import { evaluate } from 'mathjs'

interface Balloon {
  x: number
  y: number
  emoji: string
}

export default function BalloonGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [balloons, setBalloons] = useState<Balloon[]>([])
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [formula, setFormula] = useState('')
  const [arrowPosition, setArrowPosition] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight * 0.9 // Leave space for input field
      setCanvasSize({ width, height })
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (canvasSize.width === 0 || canvasSize.height === 0) return

    const newBalloons: Balloon[] = []
    const balloonEmojis = ['🎈', '🎈', '🎈', '🎈', '🎈']
    for (let i = 0; i < 10; i++) {
      newBalloons.push({
        x: Math.random() * canvasSize.width,
        y: Math.random() * (canvasSize.height * 0.8), // Keep balloons in upper 80% of screen
        emoji: balloonEmojis[Math.floor(Math.random() * balloonEmojis.length)]
      })
    }
    setBalloons(newBalloons)
  }, [canvasSize])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawAxes = () => {
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 2

      // X-axis
      ctx.beginPath()
      ctx.moveTo(0, canvasSize.height / 2)
      ctx.lineTo(canvasSize.width, canvasSize.height / 2)
      ctx.stroke()

      // Y-axis
      ctx.beginPath()
      ctx.moveTo(canvasSize.width / 2, 0)
      ctx.lineTo(canvasSize.width / 2, canvasSize.height)
      ctx.stroke()
    }

    const drawBalloons = () => {
      balloons.forEach(balloon => {
        ctx.font = '30px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(balloon.emoji, balloon.x, balloon.y)
      })
    }

    const drawArrow = () => {
      if (arrowPosition) {
        ctx.fillStyle = 'red'
        ctx.beginPath()
        ctx.arc(arrowPosition.x, arrowPosition.y, 5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
    drawAxes()
    drawBalloons()
    drawArrow()
  }, [canvasSize, balloons, arrowPosition])

  const handleFormulaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const arrowX = -canvasSize.width / 2
      const arrowY = evaluate(formula, { x: arrowX })
      setArrowPosition({ x: arrowX + canvasSize.width / 2, y: canvasSize.height / 2 - arrowY })

      const intervalId = setInterval(() => {
        setArrowPosition(prev => {
          if (!prev) return null
          const newX = prev.x + 5
          const newY = canvasSize.height / 2 - evaluate(formula, { x: newX - canvasSize.width / 2 })

          // Check for collisions
          setBalloons(prevBalloons => 
            prevBalloons.filter(balloon => 
              Math.sqrt((balloon.x - newX) ** 2 + (balloon.y - newY) ** 2) > 15
            )
          )

          if (newX > canvasSize.width) {
            clearInterval(intervalId)
            return null
          }
          return { x: newX, y: newY }
        })
      }, 50)
    } catch (error) {
      console.error('Invalid formula:', error)
    }
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100">
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
        <input
          type="text"
          id="formula"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 mr-2"
          placeholder="Enter formula (e.g., 2*x + 1)"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">
          Shoot
        </button>
      </form>
    </div>
  )
}

