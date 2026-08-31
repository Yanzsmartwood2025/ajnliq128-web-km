'use client'

import React, { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import { BubbleWrapper } from './BubbleWrapper'
import { mediaUrl } from '@/lib/media-urls'

interface PhysicsBubblesProps {
  onSelectModule: (module: 'ARIA' | 'JOZIEL' | 'NAYLA') => void;
}

export default function PhysicsBubbles({ onSelectModule }: PhysicsBubblesProps) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)

  const [positions, setPositions] = useState({
    ARIA: { x: -1000, y: -1000, angle: 0 },
    JOZIEL: { x: -1000, y: -1000, angle: 0 },
    NAYLA: { x: -1000, y: -1000, angle: 0 },
  })
  const [isReady, setIsReady] = useState(false)

  // To track click vs drag
  const clickPosRef = useRef<{x: number, y: number, time: number} | null>(null)

  useEffect(() => {
    if (!sceneRef.current) return

    const sceneEl = sceneRef.current
    // Force use of window bounds to avoid relative container clipping issues
    const width = window.innerWidth
    const height = window.innerHeight

    // Initialize Engine
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0, scale: 0 }
    })
    engineRef.current = engine

    // Create bodies
    const radius = window.innerWidth < 768 ? 40 : 60 // responsive radius roughly matching original
    const options = {
      restitution: 0.8, // Bounciness
      friction: 0.05,
      frictionAir: 0.02,
      density: 0.001
    }

    // AJN starting positions (all spawn near the center now)
    const center = { x: width / 2, y: height / 2 }
    const initialPositions = {
      ARIA: { x: center.x - radius * 2, y: center.y },
      JOZIEL: { x: center.x + radius * 2, y: center.y },
      NAYLA: { x: center.x, y: center.y - radius * 2 }
    }

    const ariaBody = Matter.Bodies.circle(initialPositions.ARIA.x, initialPositions.ARIA.y, radius, { ...options, label: 'ARIA' })
    const jozielBody = Matter.Bodies.circle(initialPositions.JOZIEL.x, initialPositions.JOZIEL.y, radius, { ...options, label: 'JOZIEL' })
    const naylaBody = Matter.Bodies.circle(initialPositions.NAYLA.x, initialPositions.NAYLA.y, radius, { ...options, label: 'NAYLA' })

    const bodiesMap: Record<string, Matter.Body> = {
      ARIA: ariaBody,
      JOZIEL: jozielBody,
      NAYLA: naylaBody
    }

    // Walls
    const wallOptions = { isStatic: true, restitution: 1.0, friction: 0 }
    // Make walls 1000px thick to prevent high-velocity tunneling.
    // Center them based on width/height, placing the inner edge exactly on the screen bounds.
    const wallThickness = 1000;
    const walls = [
      Matter.Bodies.rectangle(width / 2, -wallThickness / 2, width * 2, wallThickness, wallOptions), // Top
      Matter.Bodies.rectangle(width / 2, height + wallThickness / 2, width * 2, wallThickness, wallOptions), // Bottom
      Matter.Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, wallOptions), // Left
      Matter.Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, wallOptions) // Right
    ]

    Matter.Composite.add(engine.world, [ariaBody, jozielBody, naylaBody, ...walls])

    // Mouse constraint for dragging
    // We attach the mouse to the sceneRef, but since it's full overlay, we need to ensure events pass through or are captured properly.
    const mouse = Matter.Mouse.create(sceneEl)
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    })

    // Allow scrolling through the canvas when not interacting with a body
    // Typecast for Matter.Mouse internals
    const m = mouseConstraint.mouse as any;
    if (m.mousewheel) {
      m.element.removeEventListener("mousewheel", m.mousewheel);
      m.element.removeEventListener("DOMMouseScroll", m.mousewheel);
    }

    Matter.Composite.add(engine.world, mouseConstraint)

    // Spring/Gravity logic to return to initial positions
    let lastInteractionTime = Date.now()

    Matter.Events.on(mouseConstraint, 'startdrag', () => {
      lastInteractionTime = Date.now()
    })
    Matter.Events.on(mouseConstraint, 'mousemove', () => {
      if (mouseConstraint.body) {
         lastInteractionTime = Date.now()
      }
    })
    Matter.Events.on(mouseConstraint, 'enddrag', () => {
      lastInteractionTime = Date.now()
    })

    Matter.Events.on(engine, 'beforeUpdate', () => {
      const currentWidth = window.innerWidth
      const currentHeight = window.innerHeight
      const timeSinceInteraction = Date.now() - lastInteractionTime

      // Rescue logic: Teleport bodies back to center if they escape the bounds
      ;(['ARIA', 'JOZIEL', 'NAYLA'] as const).forEach((label) => {
        const body = bodiesMap[label]
        if (
          body.position.x < -100 ||
          body.position.x > currentWidth + 100 ||
          body.position.y < -100 ||
          body.position.y > currentHeight + 100
        ) {
          Matter.Body.setPosition(body, { x: currentWidth / 2, y: currentHeight / 2 })
          Matter.Body.setVelocity(body, { x: 0, y: 0 })
        }
      })

      ;(['ARIA', 'JOZIEL', 'NAYLA'] as const).forEach((label) => {
        const body = bodiesMap[label]

        // Self-correcting torque (Roly-Poly / Tentetieso effect)
        // Spring-like force pulling the angle back to 0
        const torqueSpring = 0.001; // Adjust for stiffness
        const torqueDamping = 0.9;  // Adjust for bounce/elasticity

        // Calculate torque to pull towards angle 0
        // We normalize the angle to stay within -PI and PI to prevent crazy spinning
        const currentAngle = body.angle % (Math.PI * 2);
        let targetAngle = 0;

        // Find shortest path to 0
        if (currentAngle > Math.PI) targetAngle = Math.PI * 2;
        if (currentAngle < -Math.PI) targetAngle = -Math.PI * 2;

        const angularDiff = targetAngle - currentAngle;

        // Apply torque proportional to the difference
        body.torque = angularDiff * torqueSpring;
        // Apply damping ONLY to the angular velocity added by the spring, not globally.
        // We do this by applying an angular friction that is only strong when the angle is small,
        // or by making torqueDamping much closer to 1 (e.g. 0.98) so it doesn't kill collision spins instantly.
        // Let's use 0.98 so it still spins wildly on collision but settles eventually.
        Matter.Body.setAngularVelocity(body, body.angularVelocity * 0.98);

        // Add random gentle noise force so they constantly float
        // Using a tiny random force updated every frame
        const noiseX = (Math.random() - 0.5) * 0.00005
        const noiseY = (Math.random() - 0.5) * 0.00005

        Matter.Body.applyForce(body, body.position, {
          x: noiseX,
          y: noiseY
        })
      })

      // Apply active repulsion between bubbles to keep them separated
      const repulsionStrength = 0.00003;
      const labels = ['ARIA', 'JOZIEL', 'NAYLA'] as const;

      for (let i = 0; i < labels.length; i++) {
        for (let j = i + 1; j < labels.length; j++) {
          const bodyA = bodiesMap[labels[i]];
          const bodyB = bodiesMap[labels[j]];

          const dx = bodyA.position.x - bodyB.position.x;
          const dy = bodyA.position.y - bodyB.position.y;
          const distance = Math.hypot(dx, dy);

          // Repel if they get closer than 3.5x their radius
          const minDistance = radius * 3.5;
          if (distance > 0 && distance < minDistance) {
             const force = (minDistance - distance) / minDistance * repulsionStrength;
             const forceX = (dx / distance) * force;
             const forceY = (dy / distance) * force;

             Matter.Body.applyForce(bodyA, bodyA.position, { x: forceX, y: forceY });
             Matter.Body.applyForce(bodyB, bodyB.position, { x: -forceX, y: -forceY });
          }
        }
      }

      if (timeSinceInteraction > 5000 && !mouseConstraint.body) {
        // Apply soft attractive force towards the center of the screen
        const screenCenter = { x: currentWidth / 2, y: currentHeight / 2 };
        labels.forEach((label) => {
          const body = bodiesMap[label]
          const target = screenCenter

          const dx = target.x - body.position.x
          const dy = target.y - body.position.y

          // Very gentle pull towards exact center
          const forceMagnitude = 0.000005
          Matter.Body.applyForce(body, body.position, {
            x: dx * forceMagnitude,
            y: dy * forceMagnitude
          })

          // Maintain momentum slightly to keep alive
          Matter.Body.setVelocity(body, {
             x: body.velocity.x * 0.99,
             y: body.velocity.y * 0.99
          })
        })
      }
    })

    // Native React onClick will handle selection now to improve sensitivity
    // Removed Matter.js custom click logic based on mousedown/up duration

    // Update dimensions on resize
    const handleResize = () => {
       const newWidth = window.innerWidth
       const newHeight = window.innerHeight
       // Ensure walls span massive lengths to cover all resizing edge cases
       // Since they were created with width * 2, scaling them on every resize is tricky.
       // Instead, we just position them exactly at the new screen boundaries.
       // Their length is technically set at load to `window.innerWidth * 2`,
       // but to be perfectly safe, we update their vertices dynamically using Matter.Body.setVertices

       // Create fresh rectangles of the correct updated bounds and copy their vertices
       const newTop = Matter.Bodies.rectangle(newWidth / 2, -wallThickness / 2, newWidth * 5, wallThickness)
       const newBottom = Matter.Bodies.rectangle(newWidth / 2, newHeight + wallThickness / 2, newWidth * 5, wallThickness)
       const newLeft = Matter.Bodies.rectangle(-wallThickness / 2, newHeight / 2, wallThickness, newHeight * 5)
       const newRight = Matter.Bodies.rectangle(newWidth + wallThickness / 2, newHeight / 2, wallThickness, newHeight * 5)

       Matter.Body.setVertices(walls[0], newTop.vertices)
       Matter.Body.setVertices(walls[1], newBottom.vertices)
       Matter.Body.setVertices(walls[2], newLeft.vertices)
       Matter.Body.setVertices(walls[3], newRight.vertices)

       // Reposition them just in case setVertices drifts the center of mass
       Matter.Body.setPosition(walls[0], { x: newWidth / 2, y: -wallThickness / 2 })
       Matter.Body.setPosition(walls[1], { x: newWidth / 2, y: newHeight + wallThickness / 2 })
       Matter.Body.setPosition(walls[2], { x: -wallThickness / 2, y: newHeight / 2 })
       Matter.Body.setPosition(walls[3], { x: newWidth + wallThickness / 2, y: newHeight / 2 })

       // Initial positions update
       const newCenter = { x: newWidth / 2, y: newHeight / 2 }
       initialPositions.ARIA = { x: newCenter.x - radius * 2, y: newCenter.y }
       initialPositions.JOZIEL = { x: newCenter.x + radius * 2, y: newCenter.y }
       initialPositions.NAYLA = { x: newCenter.x, y: newCenter.y - radius * 2 }
    }
    window.addEventListener('resize', handleResize)

    // Animation Loop
    let animationFrame: number
    let lastTime = performance.now()
    const update = (time: number) => {
      const delta = time - lastTime
      lastTime = time

      // Cap delta at 50ms to prevent huge jumps if tab is inactive
      Matter.Engine.update(engine, Math.min(delta, 50))

      setPositions({
        ARIA: { x: ariaBody.position.x, y: ariaBody.position.y, angle: ariaBody.angle },
        JOZIEL: { x: jozielBody.position.x, y: jozielBody.position.y, angle: jozielBody.angle },
        NAYLA: { x: naylaBody.position.x, y: naylaBody.position.y, angle: naylaBody.angle }
      })

      animationFrame = requestAnimationFrame(update)
    }
    animationFrame = requestAnimationFrame(update)
    setIsReady(true)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrame)
      Matter.Engine.clear(engine)
      if (engineRef.current) {
        Matter.World.clear(engine.world, false)
      }
    }
  }, [onSelectModule])

  const bubbleRadius = typeof window !== 'undefined' && window.innerWidth < 768 ? 40 : 60 // Roughly half of standard 80-120px

  const getVideoSrc = (module: string) => {
    switch (module) {
      case 'ARIA': return mediaUrl('fuego/botones/aria-preview.mp4')
      case 'JOZIEL': return mediaUrl('fuego/botones/joziel-preview.mp4')
      case 'NAYLA': return mediaUrl('fuego/botones/nayla-preview.mp4')
      default: return ''
    }
  }

  const getFallbackSrc = (module: string) => {
    switch (module) {
      case 'ARIA': return '/placeholder-video-1.mp4'
      case 'JOZIEL': return '/placeholder-video-2.mp4'
      case 'NAYLA': return '/placeholder-video-3.mp4'
      default: return ''
    }
  }

  const getLogoSrc = (module: string) => {
    switch (module) {
      case 'ARIA': return mediaUrl('aria/imagenes/aria-logo.png')
      case 'JOZIEL': return mediaUrl('joziel/imagenes/joziel-logo.png')
      case 'NAYLA': return mediaUrl('nayla/imagenes/nayla-logo.png')
      default: return ''
    }
  }

  return (
    <div ref={sceneRef} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 2 }}>
       {isReady && ['ARIA', 'JOZIEL', 'NAYLA'].map(module => {
          const pos = positions[module as keyof typeof positions]
          return (
             <div
               key={module}
               style={{
                 position: 'absolute',
                 left: pos.x - bubbleRadius,
                 top: pos.y - bubbleRadius,
                 width: bubbleRadius * 2,
                 height: bubbleRadius * 2,
                 transform: `rotate(${pos.angle}rad)`,
                 pointerEvents: 'auto' // React to DOM events, matter.js will still track mouse on background
               }}
               onPointerDown={(e) => {
                 clickPosRef.current = { x: e.clientX, y: e.clientY, time: Date.now() }
               }}
               onPointerUp={(e) => {
                 if (clickPosRef.current) {
                   const { x, y, time } = clickPosRef.current
                   const dist = Math.hypot(e.clientX - x, e.clientY - y)
                   const duration = Date.now() - time
                   if (dist < 10 && duration < 300) {
                     onSelectModule(module as 'ARIA' | 'JOZIEL' | 'NAYLA')
                   }
                   clickPosRef.current = null
                 }
               }}
             >
                <BubbleWrapper className="floating-bubble">
                  <div className="bubble-video-container" style={{ opacity: 0 }}>
                    <video
                      src={getVideoSrc(module)}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="bubble-video"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getFallbackSrc(module);
                      }}
                    />
                  </div>
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
                        paddingBottom: module === 'JOZIEL' ? '12%' : '0'
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
