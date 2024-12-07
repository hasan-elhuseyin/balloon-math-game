'use client'

import React, { useRef, useEffect } from 'react'
import { AnimatedBalloon, Balloons } from '../models/BalloonManager'

const BALLOON_COUNT = 20
const ROCKET_COUNT = 3

interface Rocket {
  x: number
  y: number
  speed: number
  angle: number
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const canvasEl = canvas
    const context = ctx

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const balloons: AnimatedBalloon[] = Array.from({ length: BALLOON_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      velocity: Math.random() * 0.5 + 0.1,
      type: Balloons.red.type
    }))

    const rockets: Rocket[] = Array.from({ length: ROCKET_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: Math.random() * 2 + 1,
      angle: Math.random() * Math.PI * 2
    }))

    function animate() {
      context.clearRect(0, 0, canvasEl.width, canvasEl.height)

      balloons.forEach(balloon => {
        balloon.y -= balloon.velocity
        if (balloon.y < -60) balloon.y = canvasEl.height + 60
        context.font = '60px Arial'
        context.fillText(Balloons.red.emoji, balloon.x, balloon.y)
      })

      rockets.forEach(rocket => {
        rocket.x += Math.cos(rocket.angle) * rocket.speed
        rocket.y += Math.sin(rocket.angle) * rocket.speed
        if (rocket.x < -30) rocket.x = canvasEl.width + 30
        if (rocket.x > canvasEl.width + 30) rocket.x = -30
        if (rocket.y < -30) rocket.y = canvasEl.height + 30
        if (rocket.y > canvasEl.height + 30) rocket.y = -30
        context.font = '30px Arial'
        context.fillText('🚀', rocket.x, rocket.y)
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />
}

