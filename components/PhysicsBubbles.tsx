'use client'

import React, { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import { BubbleWrapper } from './BubbleWrapper'
import { mediaUrl } from '@/lib/media-urls'

type BubbleModule = 'ARIA' | 'JOZIEL' | 'NAYLA'

type BubblePosition = { x: number; y: number; angle: number }

interface PhysicsBubblesProps {
  onSelectModule: (module: BubbleModule) => void
  focusModule?: BubbleModule | null
  interactive?: boolean
}

export default function PhysicsBubbles({ onSelectModule, focusModule = null, interactive = true }: PhysicsBubblesProps) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const focusModuleRef = useRef<BubbleModule | null>(focusModule)
  const [positions, setPositions] = useState<Record<BubbleModule, BubblePosition>>({
    ARIA: { x: -1000, y: -1000, angle: 0 },
    JOZIEL: { x: -1000, y: -1000, angle: 0 },
    NAYLA: { x: -1000, y: -1000, angle: 0 },
  })
  const [isReady, setIsReady] = useState(false)
  const clickPosRef = useRef<{ x: number; y: number; time: number } | null>(null)

  useEffect(() => {
    focusModuleRef.current = focusModule
  }, [focusModule])

  useEffect(() => {
    const sceneEl = sceneRef.current
    if (!sceneEl) return

    const isMobile = window.innerWidth < 768
    const radius = isMobile ? 40 : 60
    const centerYRatio = isMobile ? 0.56 : 0.52
    const anchorSpread = radius * (isMobile ? 2.6 : 2.8)
    const naylaLift = radius * (isMobile ? 1.48 : 1.58)
    const labels: BubbleModule[] = ['ARIA', 'JOZIEL', 'NAYLA']

    const getAnchors = (width: number, height: number) => {
      const center = { x: width / 2, y: height * centerYRatio }
      return {
        ARIA: { x: center.x - anchorSpread, y: center.y + radius * 0.22 },
        JOZIEL: { x: center.x + anchorSpread, y: center.y + radius * 0.22 },
        NAYLA: { x: center.x, y: center.y - naylaLift },
      }
    }

    const startWidth = window.innerWidth
    const startHeight = window.innerHeight
    const anchors = getAnchors(startWidth, startHeight)

    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0, scale: 0 } })
    const bodyOptions = {
      restitution: 0.78,
      friction: 0.04,
      frictionAir: 0.025,
      density: 0.005,
    }

    const bodiesMap: Record<BubbleModule, Matter.Body> = {
      ARIA: Matter.Bodies.circle(anchors.ARIA.x, anchors.ARIA.y, radius, { ...bodyOptions, label: 'ARIA' }),
      JOZIEL: Matter.Bodies.circle(anchors.JOZIEL.x, anchors.JOZIEL.y, radius, { ...bodyOptions, label: 'JOZIEL' }),
      NAYLA: Matter.Bodies.circle(anchors.NAYLA.x, anchors.NAYLA.y, radius, { ...bodyOptions, label: 'NAYLA' }),
    }

    const wallThickness = 1000
    const wallOptions = { isStatic: true, restitution: 0.9, friction: 0 }
    const walls = [
      Matter.Bodies.rectangle(startWidth / 2, -wallThickness / 2, startWidth * 4, wallThickness, wallOptions),
      Matter.Bodies.rectangle(startWidth / 2, startHeight + wallThickness / 2, startWidth * 4, wallThickness, wallOptions),
      Matter.Bodies.rectangle(-wallThickness / 2, startHeight / 2, wallThickness, startHeight * 4, wallOptions),
      Matter.Bodies.rectangle(startWidth + wallThickness / 2, startHeight / 2, wallThickness, startHeight * 4, wallOptions),
    ]

    Matter.Composite.add(engine.world, [...labels.map(label => bodiesMap[label]), ...walls])

    const mouse = Matter.Mouse.create(sceneEl)
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.22,
        damping: 0.08,
        render: { visible: false },
      },
    })

    const mouseInternals = mouse as any
    if (mouseInternals.mousewheel) {
      mouseInternals.element.removeEventListener('mousewheel', mouseInternals.mousewheel)
      mouseInternals.element.removeEventListener('DOMMouseScroll', mouseInternals.mousewheel)
    }

    if (interactive) Matter.Composite.add(engine.world, mouseConstraint)

    let lastInteractionTime = Date.now() - 1000

    const markInteraction = () => {
      lastInteractionTime = Date.now()
    }

    if (interactive) {
      Matter.Events.on(mouseConstraint, 'startdrag', markInteraction)
      Matter.Events.on(mouseConstraint, 'mousemove', () => {
        if (mouseConstraint.body) markInteraction()
      })
      Matter.Events.on(mouseConstraint, 'enddrag', markInteraction)
    }

    const beforeUpdate = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const currentAnchors = getAnchors(width, height)
      const screenCenter = { x: width / 2, y: height * centerYRatio }
      const returning = Date.now() - lastInteractionTime > 550 && !mouseConstraint.body

      labels.forEach((label) => {
        const body = bodiesMap[label]

        if (
          body.position.x < -120 || body.position.x > width + 120 ||
          body.position.y < -120 || body.position.y > height + 120
        ) {
          Matter.Body.setPosition(body, currentAnchors[label])
          Matter.Body.setVelocity(body, { x: 0, y: 0 })
        }

        const speed = Math.hypot(body.velocity.x, body.velocity.y)
        if (speed > 15) {
          const scale = 15 / speed
          Matter.Body.setVelocity(body, {
            x: body.velocity.x * scale,
            y: body.velocity.y * scale,
          })
        }

        const normalizedAngle = Math.atan2(Math.sin(body.angle), Math.cos(body.angle))
        body.torque = -normalizedAngle * 0.0012
        Matter.Body.setAngularVelocity(body, body.angularVelocity * 0.965)

        if (!returning || mouseConstraint.body === body) return

        const target = focusModuleRef.current === label ? screenCenter : currentAnchors[label]
        const dx = target.x - body.position.x
        const dy = target.y - body.position.y
        const distance = Math.hypot(dx, dy)
        const spring = focusModuleRef.current === label ? 0.00004 : 0.000028

        Matter.Body.applyForce(body, body.position, { x: dx * spring, y: dy * spring })
        Matter.Body.setVelocity(body, {
          x: body.velocity.x * 0.9,
          y: body.velocity.y * 0.9,
        })

        if (distance < 3 && Math.hypot(body.velocity.x, body.velocity.y) < 0.7) {
          Matter.Body.setPosition(body, target)
          Matter.Body.setVelocity(body, { x: 0, y: 0 })
          Matter.Body.setAngle(body, 0)
          Matter.Body.setAngularVelocity(body, 0)
        }
      })

      const minimumDistance = radius * 2.16
      for (let i = 0; i < labels.length; i += 1) {
        for (let j = i + 1; j < labels.length; j += 1) {
          const bodyA = bodiesMap[labels[i]]
          const bodyB = bodiesMap[labels[j]]
          const dx = bodyA.position.x - bodyB.position.x
          const dy = bodyA.position.y - bodyB.position.y
          const distance = Math.hypot(dx, dy)

          if (distance <= 0 || distance >= minimumDistance) continue

          const correction = (minimumDistance - distance) * 0.16
          const offsetX = (dx / distance) * correction
          const offsetY = (dy / distance) * correction
          const draggingA = mouseConstraint.body === bodyA
          const draggingB = mouseConstraint.body === bodyB

          if (!draggingA) Matter.Body.translate(bodyA, { x: offsetX, y: offsetY })
          if (!draggingB) Matter.Body.translate(bodyB, { x: -offsetX, y: -offsetY })
        }
      }
    }

    Matter.Events.on(engine, 'beforeUpdate', beforeUpdate)

    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      Matter.Body.setPosition(walls[0], { x: width / 2, y: -wallThickness / 2 })
      Matter.Body.setPosition(walls[1], { x: width / 2, y: height + wallThickness / 2 })
      Matter.Body.setPosition(walls[2], { x: -wallThickness / 2, y: height / 2 })
      Matter.Body.setPosition(walls[3], { x: width + wallThickness / 2, y: height / 2 })
      lastInteractionTime = Date.now() - 1000
    }

    window.addEventListener('resize', handleResize)

    let animationFrame = 0
    let lastFrame = performance.now()
    const targetFrameMs = isMobile ? 1000 / 30 : 1000 / 60

    const update = (time: number) => {
      const delta = time - lastFrame
      if (delta >= targetFrameMs) {
        lastFrame = time
        Matter.Engine.update(engine, Math.min(delta, isMobile ? 36 : 50))
        setPositions({
          ARIA: { x: bodiesMap.ARIA.position.x, y: bodiesMap.ARIA.position.y, angle: bodiesMap.ARIA.angle },
          JOZIEL: { x: bodiesMap.JOZIEL.position.x, y: bodiesMap.JOZIEL.position.y, angle: bodiesMap.JOZIEL.angle },
          NAYLA: { x: bodiesMap.NAYLA.position.x, y: bodiesMap.NAYLA.position.y, angle: bodiesMap.NAYLA.angle },
        })
      }
      animationFrame = window.requestAnimationFrame(update)
    }

    setPositions({
      ARIA: { x: bodiesMap.ARIA.position.x, y: bodiesMap.ARIA.position.y, angle: 0 },
      JOZIEL: { x: bodiesMap.JOZIEL.position.x, y: bodiesMap.JOZIEL.position.y, angle: 0 },
      NAYLA: { x: bodiesMap.NAYLA.position.x, y: bodiesMap.NAYLA.position.y, angle: 0 },
    })
    setIsReady(true)
    animationFrame = window.requestAnimationFrame(update)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.cancelAnimationFrame(animationFrame)
      Matter.Events.off(engine, 'beforeUpdate', beforeUpdate)
      if (interactive) {
        Matter.Events.off(mouseConstraint, 'startdrag', markInteraction)
        Matter.Events.off(mouseConstraint, 'enddrag', markInteraction)
      }
      Matter.Mouse.clearSourceEvents(mouse)
      Matter.Composite.clear(engine.world, false, true)
      Matter.Engine.clear(engine)
    }
  }, [interactive, onSelectModule])

  const bubbleRadius = typeof window !== 'undefined' && window.innerWidth < 768 ? 40 : 60

  const getLogoSrc = (module: BubbleModule) => {
    if (module === 'ARIA') return mediaUrl('aria/imagenes/aria-logo.png')
    if (module === 'JOZIEL') return mediaUrl('joziel/imagenes/joziel-logo.png')
    return mediaUrl('nayla/imagenes/nayla-logo.png')
  }

  return (
    <div ref={sceneRef} style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 2 }}>
      {isReady && (['ARIA', 'JOZIEL', 'NAYLA'] as BubbleModule[]).map(module => {
        const pos = positions[module]
        return (
          <div
            key={module}
            style={{
              position: 'absolute',
              left: pos.x - bubbleRadius,
              top: pos.y - bubbleRadius,
              width: bubbleRadius * 2,
              height: bubbleRadius * 2,
              transform: `rotate(${pos.angle}rad) scale(${focusModule === module ? 1.72 : focusModule ? 0.78 : 1})`,
              opacity: focusModule && focusModule !== module ? 0.34 : 1,
              filter: focusModule === module ? 'drop-shadow(0 0 28px rgba(255,255,255,.34))' : 'none',
              transition: 'transform 1.25s cubic-bezier(.2,.8,.2,1), opacity .8s ease, filter .8s ease',
              pointerEvents: interactive ? 'auto' : 'none',
              willChange: 'transform',
              contain: 'layout paint style',
            }}
            onPointerDown={(e) => {
              if (!interactive) return
              clickPosRef.current = { x: e.clientX, y: e.clientY, time: Date.now() }
            }}
            onPointerUp={(e) => {
              if (!interactive || !clickPosRef.current) return
              const { x, y, time } = clickPosRef.current
              const distance = Math.hypot(e.clientX - x, e.clientY - y)
              const duration = Date.now() - time
              if (distance < 10 && duration < 300) onSelectModule(module)
              clickPosRef.current = null
            }}
          >
            <BubbleWrapper className="floating-bubble" simple={!interactive} style={{ width: '100%', height: '100%' }}>
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16%' }}>
                <img
                  src={getLogoSrc(module)}
                  alt={`${module} logo`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    paddingBottom: module === 'JOZIEL' ? '12%' : '0',
                  }}
                />
              </div>
            </BubbleWrapper>
          </div>
        )
      })}
    </div>
  )
}
