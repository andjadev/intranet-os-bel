'use client'

import { useEffect, useRef } from 'react'

/**
 * The OS swirl mark as a small particle cloud, after the hero animation on the company website
 * (C:\os-website, ParticleEmblem), redrawn in 2D canvas so the header needs no 3D library.
 * Particles fly in and assemble on load, sway gently, dodge the cursor and burst apart and
 * regroup when the pointer enters the home link.
 */

const EMBLEM_PATHS = [
  'M527.77,22.27,488.19,90.81a8.61,8.61,0,0,0-1,7,8.77,8.77,0,0,0,3.05,4.48h0A84.4,84.4,0,0,1,406.9,245.82v0a8.27,8.27,0,0,0-5.24-.21,9.21,9.21,0,0,0-5.52,4.57l-2.83,4.89A134.68,134.68,0,0,0,527.77,22.27',
  'M511,19.09l2.82-4.89A134.68,134.68,0,0,0,379.31,247l39.59-68.54a8.58,8.58,0,0,0-2-11.43h0A84.4,84.4,0,0,1,500.19,23.47v0a8.27,8.27,0,0,0,5.24.22A9.32,9.32,0,0,0,511,19.09',
]
const VIEW = { x: 317, y: 0, w: 273, h: 272 }
const PALETTE = ['#009fe3', '#007cf0', '#54bff0', '#93d7f7']
const EDGE_COLOR = '#eaf8ff'
/** Emblem size in CSS px; the canvas is three times wider and taller so particles can fly in. */
const SIZE = 44
const CANVAS = SIZE * 3

type Particle = { hx: number; hy: number; x: number; y: number; vx: number; vy: number; phase: number; color: string; r: number }

function sampleEmblem(): { x: number; y: number; edge: boolean }[] {
  const res = 120
  const step = 3.4
  const off = document.createElement('canvas')
  off.width = res
  off.height = res
  const ctx = off.getContext('2d')!
  const scale = res / VIEW.h
  ctx.setTransform(scale, 0, 0, scale, -VIEW.x * scale + (res - VIEW.w * scale) / 2, -VIEW.y * scale)
  ctx.fillStyle = '#fff'
  for (const d of EMBLEM_PATHS) ctx.fill(new Path2D(d))
  const data = ctx.getImageData(0, 0, res, res).data
  const solid = (x: number, y: number) => {
    const xx = Math.round(x)
    const yy = Math.round(y)
    return xx >= 0 && yy >= 0 && xx < res && yy < res && data[(yy * res + xx) * 4 + 3] > 128
  }
  const points: { x: number; y: number; edge: boolean }[] = []
  for (let y = 0; y < res; y += step) {
    for (let x = 0; x < res; x += step) {
      if (!solid(x, y)) continue
      const edge = !solid(x - step, y) || !solid(x + step, y) || !solid(x, y - step) || !solid(x, y + step)
      points.push({ x: x / res, y: y / res, edge })
    }
  }
  return points
}

export function BrandEmblem() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = CANVAS * dpr
    canvas.height = CANVAS * dpr
    ctx.scale(dpr, dpr)

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const centre = CANVAS / 2
    const particles: Particle[] = sampleEmblem().map((p) => {
      const hx = centre + (p.x - 0.5) * SIZE
      const hy = centre + (p.y - 0.5) * SIZE
      const angle = Math.random() * Math.PI * 2
      const dist = SIZE * (0.8 + Math.random() * 0.7)
      return {
        hx,
        hy,
        x: still ? hx : centre + Math.cos(angle) * dist,
        y: still ? hy : centre + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        phase: Math.random() * Math.PI * 2,
        color: p.edge ? EDGE_COLOR : PALETTE[(Math.random() * PALETTE.length) | 0],
        r: p.edge ? 0.75 : 0.65,
      }
    })

    const mouse = { x: -1e4, y: -1e4 }
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const burst = () => {
      for (const p of particles) {
        const a = Math.random() * Math.PI * 2
        const s = 2 + Math.random() * 3
        p.vx += Math.cos(a) * s
        p.vy += Math.sin(a) * s
      }
    }
    const link = canvas.closest('a')
    if (!still) {
      window.addEventListener('pointermove', onMove, { passive: true })
      link?.addEventListener('pointerenter', burst)
    }

    let raf = 0
    const start = performance.now()
    const draw = (now: number) => {
      const t = (now - start) / 1000
      // Gentle sway around the vertical axis, like the website's 3D emblem.
      const sway = still ? 1 : Math.cos(Math.sin(t * 0.5) * 0.35)
      ctx.clearRect(0, 0, CANVAS, CANVAS)
      ctx.globalCompositeOperation = 'lighter'
      for (const p of particles) {
        if (!still) {
          const tx = centre + (p.hx - centre) * sway + Math.sin(t * 0.8 + p.phase) * 0.35
          const ty = p.hy + Math.cos(t * 0.7 + p.phase) * 0.35
          let ax = (tx - p.x) * 0.065
          let ay = (ty - p.y) * 0.065
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const d2 = dx * dx + dy * dy
          if (d2 < 144) {
            const d = Math.sqrt(d2) || 1
            const f = (1 - d / 12) * 1.4
            ax += (dx / d) * f
            ay += (dy / d) * f
          }
          p.vx = (p.vx + ax) * 0.88
          p.vy = (p.vy + ay) * 0.88
          p.x += p.vx
          p.y += p.vy
        }
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      if (!still) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      link?.removeEventListener('pointerenter', burst)
    }
  }, [])

  return (
    <span className="brand-emblem" aria-hidden>
      <canvas ref={canvasRef} />
    </span>
  )
}
