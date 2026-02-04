import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BowlingBall } from './BowlingBall'
import { BowlingPin } from './BowlingPin'
import { useGame } from '../context/GameContext'
import { RoundedBox, MeshReflectorMaterial } from '@react-three/drei'

export function BowlingScene() {
  const { gameState } = useGame()

  return (
    <group>
      {/* Lane */}
      <Lane />

      {/* Gutters */}
      <Gutter position={[-2.8, 0, -10]} />
      <Gutter position={[2.8, 0, -10]} />

      {/* Side barriers with neon */}
      <NeonBarrier position={[-4, 0.5, -10]} />
      <NeonBarrier position={[4, 0.5, -10]} />

      {/* Pin deck area */}
      <PinDeck />

      {/* Pins */}
      {gameState.pins.map((pin) => (
        <BowlingPin key={pin.id} pin={pin} />
      ))}

      {/* Ball */}
      <BowlingBall />

      {/* Arcade decorations */}
      <ArcadeDecorations />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -10]} receiveShadow>
        <planeGeometry args={[50, 60]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050508"
          metalness={0.5}
          mirror={0.5}
        />
      </mesh>
    </group>
  )
}

function Lane() {
  const laneTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 2048
    const ctx = canvas.getContext('2d')!

    // Wood grain base
    const gradient = ctx.createLinearGradient(0, 0, 512, 0)
    gradient.addColorStop(0, '#8B5A2B')
    gradient.addColorStop(0.2, '#CD853F')
    gradient.addColorStop(0.4, '#DEB887')
    gradient.addColorStop(0.6, '#CD853F')
    gradient.addColorStop(0.8, '#8B5A2B')
    gradient.addColorStop(1, '#CD853F')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 2048)

    // Lane lines
    ctx.strokeStyle = '#654321'
    ctx.lineWidth = 2
    for (let i = 0; i < 512; i += 32) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, 2048)
      ctx.stroke()
    }

    // Foul line
    ctx.fillStyle = '#111'
    ctx.fillRect(0, 1800, 512, 8)

    // Arrows (aiming marks)
    ctx.fillStyle = '#333'
    const arrowPositions = [128, 192, 256, 320, 384]
    arrowPositions.forEach(x => {
      ctx.beginPath()
      ctx.moveTo(x, 1400)
      ctx.lineTo(x - 15, 1450)
      ctx.lineTo(x + 15, 1450)
      ctx.closePath()
      ctx.fill()
    })

    // Dots
    ctx.fillStyle = '#222'
    const dotPositions = [85, 170, 256, 341, 426]
    dotPositions.forEach(x => {
      ctx.beginPath()
      ctx.arc(x, 1600, 6, 0, Math.PI * 2)
      ctx.fill()
    })

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    return texture
  }, [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -10]} receiveShadow>
      <planeGeometry args={[5, 35]} />
      <meshStandardMaterial
        map={laneTexture}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  )
}

function Gutter({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={[0.6, 0.3, 35]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
    </mesh>
  )
}

function NeonBarrier({ position }: { position: [number, number, number] }) {
  const tubeRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (tubeRef.current) {
      const material = tubeRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3
    }
  })

  const isLeft = position[0] < 0
  const color = isLeft ? '#ff69b4' : '#00ffff'

  return (
    <group position={position}>
      {/* Barrier base */}
      <RoundedBox args={[0.3, 1.5, 35]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color="#111" roughness={0.5} metalness={0.8} />
      </RoundedBox>

      {/* Neon tube */}
      <mesh ref={tubeRef} position={[0, 0.5, 0]}>
        <boxGeometry args={[0.05, 0.05, 34]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>

      {/* Point lights along the barrier */}
      {[-15, -5, 5, 15].map((z, i) => (
        <pointLight
          key={i}
          position={[0, 0.5, z]}
          color={color}
          intensity={0.3}
          distance={3}
        />
      ))}
    </group>
  )
}

function PinDeck() {
  return (
    <group position={[0, 0.01, -24]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial color="#f5deb3" roughness={0.4} />
      </mesh>
    </group>
  )
}

function ArcadeDecorations() {
  const neonTextRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (neonTextRef.current) {
      neonTextRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh
        const material = mesh.material as THREE.MeshStandardMaterial
        if (material.emissive) {
          material.emissiveIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 3 + i * 0.5) * 0.4
        }
      })
    }
  })

  return (
    <group>
      {/* Back wall with neon signage area */}
      <mesh position={[0, 5, -30]}>
        <boxGeometry args={[20, 12, 0.5]} />
        <meshStandardMaterial color="#0a0a12" />
      </mesh>

      {/* Neon decorative elements */}
      <group ref={neonTextRef} position={[0, 8, -29.5]}>
        {/* Diamond shape */}
        <mesh position={[-6, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[1.5, 1.5, 0.1]} />
          <meshStandardMaterial
            color="#ff1493"
            emissive="#ff1493"
            emissiveIntensity={1}
            toneMapped={false}
          />
        </mesh>

        {/* Circle */}
        <mesh position={[6, 0, 0]}>
          <torusGeometry args={[0.8, 0.1, 8, 32]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1}
            toneMapped={false}
          />
        </mesh>

        {/* Zigzag line */}
        {[-3, -1.5, 0, 1.5, 3].map((x, i) => (
          <mesh key={i} position={[x, i % 2 === 0 ? 0.5 : -0.5, 0]}>
            <boxGeometry args={[1.8, 0.1, 0.1]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#ff69b4' : '#00ffff'}
              emissive={i % 2 === 0 ? '#ff69b4' : '#00ffff'}
              emissiveIntensity={1}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {/* Side decorative panels */}
      {[-8, 8].map((x, i) => (
        <group key={i} position={[x, 4, -20]}>
          <mesh>
            <boxGeometry args={[0.5, 8, 20]} />
            <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Vertical neon strips */}
          <mesh position={[i === 0 ? 0.3 : -0.3, 0, 0]}>
            <boxGeometry args={[0.05, 7, 0.05]} />
            <meshStandardMaterial
              color={i === 0 ? '#ff69b4' : '#00ffff'}
              emissive={i === 0 ? '#ff69b4' : '#00ffff'}
              emissiveIntensity={1}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
