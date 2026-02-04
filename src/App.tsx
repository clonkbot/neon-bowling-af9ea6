import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Stars } from '@react-three/drei'
import { Suspense, useState, useCallback } from 'react'
import { BowlingScene } from './components/BowlingScene'
import { GameUI } from './components/GameUI'
import { GameProvider, useGame } from './context/GameContext'

function AppContent() {
  const { gameState, throwBall, resetPins } = useGame()
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragEnd, setDragEnd] = useState({ x: 0, y: 0 })

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (gameState.isRolling || gameState.isResetting) return
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setDragEnd({ x: e.clientX, y: e.clientY })
  }, [gameState.isRolling, gameState.isResetting])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    setDragEnd({ x: e.clientX, y: e.clientY })
  }, [isDragging])

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)

    const dx = dragStart.x - dragEnd.x
    const dy = dragStart.y - dragEnd.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > 30) {
      const power = Math.min(distance / 200, 1)
      const spin = (dx / window.innerWidth) * 2
      throwBall(power, spin)
    }
  }, [isDragging, dragStart, dragEnd, throwBall])

  return (
    <div
      className="w-screen h-screen bg-[#0a0a12] overflow-hidden relative"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Neon glow background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px]" />
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 8, 15], fov: 50 }}
        style={{ touchAction: 'none' }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#0a0a12']} />
          <fog attach="fog" args={['#0a0a12', 20, 50]} />

          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[0, 10, 0]} intensity={1} color="#ff69b4" castShadow />
          <pointLight position={[-5, 8, -10]} intensity={0.8} color="#00ffff" />
          <pointLight position={[5, 8, -10]} intensity={0.8} color="#ff1493" />
          <spotLight
            position={[0, 15, -15]}
            angle={0.3}
            penumbra={0.5}
            intensity={2}
            color="#ffffff"
            castShadow
            shadow-mapSize={[2048, 2048]}
          />

          <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

          <BowlingScene />

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.5}
            minDistance={10}
            maxDistance={30}
            target={[0, 0, -10]}
          />

          <Environment preset="night" />
        </Suspense>
      </Canvas>

      {/* Drag indicator */}
      {isDragging && (
        <svg className="absolute inset-0 pointer-events-none z-10">
          <defs>
            <linearGradient id="dragGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff69b4" />
              <stop offset="100%" stopColor="#00ffff" />
            </linearGradient>
          </defs>
          <line
            x1={dragStart.x}
            y1={dragStart.y}
            x2={dragEnd.x}
            y2={dragEnd.y}
            stroke="url(#dragGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="10 5"
            className="animate-pulse"
          />
          <circle
            cx={dragStart.x}
            cy={dragStart.y}
            r="12"
            fill="none"
            stroke="#ff69b4"
            strokeWidth="3"
          />
        </svg>
      )}

      <GameUI onReset={resetPins} />

      {/* Footer */}
      <footer className="absolute bottom-3 left-0 right-0 text-center pointer-events-none z-20">
        <p className="text-[10px] md:text-xs text-white/30 font-outfit tracking-wide">
          Requested by <span className="text-pink-400/50">@OxPaulius</span> · Built by <span className="text-cyan-400/50">@clonkbot</span>
        </p>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  )
}
