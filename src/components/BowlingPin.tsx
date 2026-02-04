import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Pin {
  id: number
  position: [number, number, number]
  knocked: boolean
}

interface BowlingPinProps {
  pin: Pin
}

export function BowlingPin({ pin }: BowlingPinProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const [fallRotation, setFallRotation] = useState({ x: 0, z: 0 })
  const [fallVelocity, setFallVelocity] = useState({ x: 0, z: 0 })
  const [yPosition, setYPosition] = useState(0)
  const [wasKnocked, setWasKnocked] = useState(false)

  useEffect(() => {
    if (pin.knocked && !wasKnocked) {
      setWasKnocked(true)
      // Random fall direction
      const angle = Math.random() * Math.PI * 2
      setFallVelocity({
        x: Math.cos(angle) * (2 + Math.random() * 3),
        z: Math.sin(angle) * (2 + Math.random() * 3),
      })
    }
    if (!pin.knocked) {
      setWasKnocked(false)
      setFallRotation({ x: 0, z: 0 })
      setFallVelocity({ x: 0, z: 0 })
      setYPosition(0)
    }
  }, [pin.knocked, wasKnocked])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    if (pin.knocked) {
      // Animate fall
      setFallRotation((prev) => ({
        x: Math.min(prev.x + fallVelocity.x * delta, Math.PI / 2),
        z: Math.min(prev.z + fallVelocity.z * delta, Math.PI / 2),
      }))

      // Drop pin slightly
      setYPosition((prev) => Math.max(prev - delta * 2, -0.3))

      groupRef.current.rotation.x = fallRotation.x
      groupRef.current.rotation.z = fallRotation.z
      groupRef.current.position.y = pin.position[1] + yPosition
    } else {
      // Slight wobble when standing
      groupRef.current.rotation.x = 0
      groupRef.current.rotation.z = 0
      groupRef.current.position.y = pin.position[1]
    }
  })

  if (pin.knocked && Math.abs(fallRotation.x) > Math.PI / 2.5) {
    // Pin has fallen, render simplified
    return (
      <group
        ref={groupRef}
        position={[pin.position[0], pin.position[1] - 0.3, pin.position[2]]}
        rotation={[fallRotation.x, 0, fallRotation.z]}
      >
        <PinGeometry opacity={0.6} />
      </group>
    )
  }

  return (
    <group ref={groupRef} position={pin.position}>
      <PinGeometry />
    </group>
  )
}

function PinGeometry({ opacity = 1 }: { opacity?: number }) {
  return (
    <group>
      {/* Pin body - using multiple cylinders to create shape */}
      {/* Base */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.3, 16]} />
        <meshStandardMaterial
          color="#f5f5f5"
          roughness={0.3}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>

      {/* Lower body */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.2, 16]} />
        <meshStandardMaterial
          color="#f5f5f5"
          roughness={0.3}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>

      {/* Middle body (widest) */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.12, 0.2, 16]} />
        <meshStandardMaterial
          color="#f5f5f5"
          roughness={0.3}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>

      {/* Upper body */}
      <mesh position={[0, 0.62, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 0.15, 16]} />
        <meshStandardMaterial
          color="#f5f5f5"
          roughness={0.3}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.1, 0.12, 16]} />
        <meshStandardMaterial
          color="#f5f5f5"
          roughness={0.3}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.88, 0]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#f5f5f5"
          roughness={0.3}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>

      {/* Red stripes */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.141, 0.141, 0.04, 16]} />
        <meshStandardMaterial
          color="#cc0000"
          emissive="#cc0000"
          emissiveIntensity={0.2}
          roughness={0.4}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.135, 0.135, 0.03, 16]} />
        <meshStandardMaterial
          color="#cc0000"
          emissive="#cc0000"
          emissiveIntensity={0.2}
          roughness={0.4}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>
    </group>
  )
}
