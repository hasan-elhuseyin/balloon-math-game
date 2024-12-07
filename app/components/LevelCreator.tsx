'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

export interface Balloon {
  x: number
  y: number
  type: 'red' | 'green' | 'blue'
}

interface LevelCreatorProps {
  onSave: (name: string, balloons: Balloon[]) => void
  onCancel: () => void
  customLevels?: Array<{ name: string; balloons: Balloon[] }>
}

const balloonEmojis = {
  red: '🎈',
  green: '🟢',
  blue: '🔵',
}

export function LevelCreator({ onSave, onCancel, customLevels }: LevelCreatorProps) {
  const [levelName, setLevelName] = useState('')
  const [balloons, setBalloons] = useState<Balloon[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [selectedBalloonType, setSelectedBalloonType] = useState<'red' | 'green' | 'blue'>('red')
  const [cursorPos, setCursorPos] = useState<{ x: number, y: number } | null>(null)

  useEffect(() => {
    const handleResize = () => {
      const width = Math.min(window.innerWidth * 0.7, window.innerHeight * 0.6)
      const height = width
      setCanvasSize({ width, height })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawAxes = () => {
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
      const xStep = canvasSize.width / (COORD_MAX - COORD_MIN)
      for (let x = COORD_MIN; x <= COORD_MAX; x++) {
        const xPos = canvasSize.width / 2 + x * xStep
        ctx.fillText(x.toString(), xPos, canvasSize.height / 2 + 20)
        
        // Draw tick marks
        ctx.beginPath()
        ctx.moveTo(xPos, canvasSize.height / 2 - 5)
        ctx.lineTo(xPos, canvasSize.height / 2 + 5)
        ctx.stroke()
      }

      // Draw Y axis labels
      const yStep = canvasSize.height / (COORD_MAX - COORD_MIN)
      for (let y = COORD_MIN; y <= COORD_MAX; y++) {
        const yPos = canvasSize.height / 2 - y * yStep
        ctx.fillText(y.toString(), canvasSize.width / 2 - 20, yPos)
        
        // Draw tick marks
        ctx.beginPath()
        ctx.moveTo(canvasSize.width / 2 - 5, yPos)
        ctx.lineTo(canvasSize.width / 2 + 5, yPos)
        ctx.stroke()
      }
    }

    const drawBalloons = () => {
      const xStep = canvasSize.width / (COORD_MAX - COORD_MIN)
      const yStep = canvasSize.height / (COORD_MAX - COORD_MIN)

      balloons.forEach(balloon => {
        const canvasX = canvasSize.width / 2 + balloon.x * xStep
        const canvasY = canvasSize.height / 2 - balloon.y * yStep
        
        ctx.font = '30px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(balloonEmojis[balloon.type], canvasX, canvasY)
      })
    }

    const drawGuideLines = () => {
      if (cursorPos) {
        // Draw dotted lines
        ctx.setLineDash([5, 5])
        ctx.strokeStyle = '#666'
        ctx.lineWidth = 1

        // Vertical guide line
        ctx.beginPath()
        ctx.moveTo(cursorPos.x, 0)
        ctx.lineTo(cursorPos.x, canvasSize.height)
        ctx.stroke()

        // Horizontal guide line
        ctx.beginPath()
        ctx.moveTo(0, cursorPos.y)
        ctx.lineTo(canvasSize.width, cursorPos.y)
        ctx.stroke()

        // Reset line style
        ctx.setLineDash([])

        // Show coordinates
        const xStep = canvasSize.width / (COORD_MAX - COORD_MIN)
        const yStep = canvasSize.height / (COORD_MAX - COORD_MIN)
        const mathX = Math.round((cursorPos.x - canvasSize.width / 2) / xStep)
        const mathY = Math.round((canvasSize.height / 2 - cursorPos.y) / yStep)

        ctx.fillStyle = '#333'
        ctx.font = '14px Arial'
        ctx.fillText(`(${mathX}, ${mathY})`, cursorPos.x + 10, cursorPos.y - 10)
      }
    }

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
    drawAxes()
    drawBalloons()
    drawGuideLines()
  }, [canvasSize, balloons, cursorPos])

  // Constants for coordinate system
  const COORD_MIN = -10
  const COORD_MAX = 10

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top

    // Convert canvas coordinates to mathematical coordinates
    const xStep = canvasSize.width / (COORD_MAX - COORD_MIN)
    const yStep = canvasSize.height / (COORD_MAX - COORD_MIN)

    const mathX = Math.round((clickX - canvasSize.width / 2) / xStep)
    const mathY = Math.round((canvasSize.height / 2 - clickY) / yStep)

    // Check if clicking on an existing balloon
    const existingBalloonIndex = balloons.findIndex(balloon => 
      balloon.x === mathX && balloon.y === mathY
    )

    if (existingBalloonIndex !== -1) {
      // Remove the balloon if it exists at this position
      setBalloons(prevBalloons => 
        prevBalloons.filter((_, index) => index !== existingBalloonIndex)
      )
      return
    }

    // Add new balloon if within bounds
    if (mathX >= COORD_MIN && mathX <= COORD_MAX && mathY >= COORD_MIN && mathY <= COORD_MAX) {
      const newBalloon: Balloon = {
        x: mathX,
        y: mathY,
        type: selectedBalloonType
      }
      setBalloons([...balloons, newBalloon])
    }
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    setCursorPos({ x, y })
  }

  const handleSave = () => {
    if (levelName.trim() === '') {
      alert('Please enter a level name')
      return
    }

    // Check if level exists in customLevels prop
    const levelExists = customLevels?.some(level => level.name === levelName)
    if (levelExists) {
      if (window.confirm(`Level "${levelName}" already exists. Do you want to overwrite it?`)) {
        onSave(levelName, balloons)
      }
    } else {
      onSave(levelName, balloons)
    }
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-4 bg-gray-100 p-8">
      <h2 className="text-2xl font-bold">Create New Level</h2>
      
      <div className="flex items-center gap-4 mb-2">
        <Input
          type="text"
          value={levelName}
          onChange={(e) => setLevelName(e.target.value)}
          placeholder="Enter level name"
          className="w-64"
        />
        <Select 
          onValueChange={(value: 'red' | 'green' | 'blue') => setSelectedBalloonType(value)} 
          defaultValue={selectedBalloonType}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select balloon type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="red">Red Balloon</SelectItem>
            <SelectItem value="green">Green Balloon</SelectItem>
            <SelectItem value="blue">Blue Balloon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setCursorPos(null)}
        className="border border-gray-300 shadow-lg bg-white"
      />

      <div className="flex gap-4 mt-2">
        <Button onClick={handleSave}>Save Level</Button>
        <Button onClick={onCancel} variant="outline">Cancel</Button>
      </div>
    </div>
  )
}

