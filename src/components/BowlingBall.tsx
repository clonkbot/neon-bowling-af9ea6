import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../context/GameContext'

export function BowlingBall() {
  const { gameState, knockPin, onBallStop } = useGame()
  const meshRef = useRef<THREE.Mesh>(null!)
  const positionRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.5, 5))
  const velocityRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0))
  const rotationRef = useRef<THREE.Euler>(new THREE.Euler(0, 0, 0))
  const hasStoppedRef = useRef(false)

  // Reset ball when game state changes
  useEffect(() => {
    if (!gameState.isRolling) {
      positionRef.current.set(0, 0.5, 5)
      velocityRef.current.set(0, 0, 0)
      hasStoppedRef.current = false
    }
  }, [gameState.isRolling])

  // Set velocity when throw happens
  useEffect(() => {
    if (gameState.isRolling && gameState.ballVelocity[2] !== 0) {
      velocityRef.current.set(
        gameState.ballVelocity[0],
        gameState.ballVelocity[1],
        gameState.ballVelocity[2]
      )
    }
  }, [gameState.ballVelocity, gameState.isRolling])

  useFrame((_, delta) => {
    if (!meshRef.current) return

    if (gameState.isRolling) {
      // Apply velocity
      positionRef.current.x += velocityRef.current.x * delta
      positionRef.current.z += velocityRef.current.z * delta

      // Apply friction
      velocityRef.current.x *= 0.995
      velocityRef.current.z *= 0.995

      // Add curve based on spin
      velocityRef.current.x += velocityRef.current.x * 0.001

      // Ball rotation based on movement
      const speed = Math.sqrt(
        velocityRef.current.x ** 2 + velocityRef.current.z ** 2
      )
      rotationRef.current.x -= (velocityRef.current.z * delta) / 0.5
      rotationRef.current.z += (velocityRef.current.x * delta) / 0.5

      // Lane boundaries (gutters)
      if (positionRef.current.x < -2.2) {
        positionRef.current.x = -2.2
        velocityRef.current.x *= -0.3
      }
      if (positionRef.current.x > 2.2) {
        positionRef.current.x = 2.2
        velocityRef.current.x *= -0.3
      }

      // Check pin collisions
      gameState.pins.forEach((pin) => {
        if (pin.knocked) return

        const pinPos = new THREE.Vector3(...pin.position)
        const dist = positionRef.current.distanceTo(pinPos)

        if (dist < 0.8) {
          knockPin(pin.id)
          // Slight deflection
          const knockDirection = new THREE.Vector3()
            .subVectors(pinPos, positionRef.current)
            .normalize()
          velocityRef.current.x -= knockDirection.x * 0.5
          velocityRef.current.z -= knockDirection.z * 0.2
        }
      })

      // Stop conditions
      if (positionRef.current.z < -28 || speed < 0.5) {
        if (!hasStoppedRef.current) {
          hasStoppedRef.current = true
          setTimeout(() => {
            onBallStop()
          }, 1000)
        }
      }
    }

    // Update mesh position
    meshRef.current.position.copy(positionRef.current)
    meshRef.current.rotation.copy(rotationRef.current)
  })

  return (
    <group>
      <mesh ref={meshRef} position={[0, 0.5, 5]} castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#1a1a2e"
          roughness={0.1}
          metalness={0.3}
          envMapIntensity={1}
        />
      </mesh>

      {/* Ball finger holes */}
      <group position={positionRef.current.toArray()}>
        {[
          [0.15, 0.4, 0],
          [-0.15, 0.4, 0],
          [0, 0.35, 0.15],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <cylinderGeometry args={[0.06, 0.06, 0.15, 16]} />
            <meshStandardMaterial color="#000" />
          </mesh>
        ))}
      </group>

      {/* Glow effect when rolling */}
      {gameState.isRolling && (
        <pointLight
          position={positionRef.current.toArray()}
          color="#ff69b4"
          intensity={2}
          distance={3}
        />
      )}
    </group>
  )
}
