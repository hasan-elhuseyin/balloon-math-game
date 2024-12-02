'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Balloon {
  x: number
  y: number
  type: 'red' | 'green' | 'blue'
}

interface LevelCreatorProps {
  onSave: (name: string, balloons: Balloon[]) => void
  onCancel: () => void
}

const balloonEmojis = {
  red: '🎈',
  green: '🟢',
  blue: '🔵',
}

export function LevelCreator({ onSave, onCancel }: LevelCreatorProps) {
  const [levelName, setLevelName] = useState('')
  const [balloons, setBalloons] = useState<Balloon[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [selectedBalloonType, setSelectedBalloonType] = useState<'red' | 'green' | 'blue'>('red')

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth * 0.8
      const height = window.innerHeight * 0.7
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
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

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

      // X-axis labels
      for (let x = -5; x <= 5; x++) {
        const xPos = (x + 5) * canvasSize.width / 10
        ctx.fillText(x.toString(), xPos, canvasSize.height / 2 + 20)
      }

      // Y-axis labels
      for (let y = -5; y <= 5; y++) {
        const yPos = canvasSize.height / 2 - y * canvasSize.height / 10
        ctx.fillText(y.toString(), canvasSize.width / 2 - 20, yPos)
      }
    }

    const drawBalloons = () => {
      balloons.forEach(balloon => {
        ctx.font = '30px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(balloonEmojis[balloon.type], balloon.x, balloon.y)
      })
    }

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
    drawAxes()
    drawBalloons()
  }, [canvasSize, balloons])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const newBalloon: Balloon = {
      x,
      y,
      type: selectedBalloonType
    }

    setBalloons([...balloons, newBalloon])
  }

  const handleSave = () => {
    if (levelName.trim() === '') {
      alert('Please enter a level name')
      return
    }
    onSave(levelName, balloons)
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Create New Level</h2>
      <Input
        type="text"
        value={levelName}
        onChange={(e) => setLevelName(e.target.value)}
        placeholder="Enter level name"
        className="mb-4"
      />
      <div className="mb-4">
        <Select onValueChange={(value: 'red' | 'green' | 'blue') => setSelectedBalloonType(value)} defaultValue={selectedBalloonType}>
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
        className="border border-gray-300 shadow-lg mb-4"
      />
      <div className="flex gap-4">
        <Button onClick={handleSave}>Save Level</Button>
        <Button onClick={onCancel} variant="outline">Cancel</Button>
      </div>
    </div>
  )
}

