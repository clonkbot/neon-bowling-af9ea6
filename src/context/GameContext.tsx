import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface Pin {
  id: number
  position: [number, number, number]
  knocked: boolean
}

interface Frame {
  roll1: number | null
  roll2: number | null
  score: number | null
}

interface GameState {
  pins: Pin[]
  ballPosition: [number, number, number]
  ballVelocity: [number, number, number]
  isRolling: boolean
  isResetting: boolean
  currentFrame: number
  currentRoll: number
  frames: Frame[]
  totalScore: number
  knockedPinsThisRoll: number
}

interface GameContextType {
  gameState: GameState
  throwBall: (power: number, spin: number) => void
  resetPins: () => void
  knockPin: (id: number) => void
  onBallStop: () => void
}

const initialPins: Pin[] = [
  // Back row (4 pins)
  { id: 1, position: [-1.5, 0.5, -25], knocked: false },
  { id: 2, position: [-0.5, 0.5, -25], knocked: false },
  { id: 3, position: [0.5, 0.5, -25], knocked: false },
  { id: 4, position: [1.5, 0.5, -25], knocked: false },
  // Third row (3 pins)
  { id: 5, position: [-1, 0.5, -24], knocked: false },
  { id: 6, position: [0, 0.5, -24], knocked: false },
  { id: 7, position: [1, 0.5, -24], knocked: false },
  // Second row (2 pins)
  { id: 8, position: [-0.5, 0.5, -23], knocked: false },
  { id: 9, position: [0.5, 0.5, -23], knocked: false },
  // Front pin (1 pin)
  { id: 10, position: [0, 0.5, -22], knocked: false },
]

const initialFrames: Frame[] = Array(10).fill(null).map(() => ({
  roll1: null,
  roll2: null,
  score: null,
}))

const GameContext = createContext<GameContextType | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>({
    pins: initialPins.map(p => ({ ...p })),
    ballPosition: [0, 0.5, 5],
    ballVelocity: [0, 0, 0],
    isRolling: false,
    isResetting: false,
    currentFrame: 0,
    currentRoll: 0,
    frames: initialFrames.map(f => ({ ...f })),
    totalScore: 0,
    knockedPinsThisRoll: 0,
  })

  const throwBall = useCallback((power: number, spin: number) => {
    if (gameState.isRolling || gameState.isResetting) return

    const velocity: [number, number, number] = [
      spin * 8,
      0,
      -(power * 30 + 15),
    ]

    setGameState(prev => ({
      ...prev,
      ballVelocity: velocity,
      isRolling: true,
      knockedPinsThisRoll: 0,
    }))
  }, [gameState.isRolling, gameState.isResetting])

  const knockPin = useCallback((id: number) => {
    setGameState(prev => {
      const pin = prev.pins.find(p => p.id === id)
      if (!pin || pin.knocked) return prev

      const newPins = prev.pins.map(p =>
        p.id === id ? { ...p, knocked: true } : p
      )

      return {
        ...prev,
        pins: newPins,
        knockedPinsThisRoll: prev.knockedPinsThisRoll + 1,
      }
    })
  }, [])

  const onBallStop = useCallback(() => {
    setGameState(prev => {
      const knockedCount = prev.knockedPinsThisRoll
      const newFrames = [...prev.frames]
      const frame = newFrames[prev.currentFrame]

      if (prev.currentRoll === 0) {
        frame.roll1 = knockedCount
      } else {
        frame.roll2 = knockedCount
      }

      // Calculate score (simplified - no spare/strike bonuses)
      let total = 0
      newFrames.forEach(f => {
        if (f.roll1 !== null) total += f.roll1
        if (f.roll2 !== null) total += f.roll2
      })

      const isStrike = prev.currentRoll === 0 && knockedCount === 10
      const frameComplete = prev.currentRoll === 1 || isStrike

      return {
        ...prev,
        isRolling: false,
        frames: newFrames,
        totalScore: total,
        currentRoll: frameComplete ? 0 : 1,
        currentFrame: frameComplete ? Math.min(prev.currentFrame + 1, 9) : prev.currentFrame,
      }
    })
  }, [])

  const resetPins = useCallback(() => {
    setGameState(prev => {
      // Check if we should do a full reset or just standing pins
      const allKnocked = prev.pins.every(p => p.knocked)
      const isNewFrame = prev.currentRoll === 0

      if (allKnocked || isNewFrame) {
        // Full reset
        return {
          ...prev,
          pins: initialPins.map(p => ({ ...p })),
          ballPosition: [0, 0.5, 5],
          ballVelocity: [0, 0, 0],
          isResetting: false,
          knockedPinsThisRoll: 0,
        }
      }

      // Just reset ball position
      return {
        ...prev,
        ballPosition: [0, 0.5, 5],
        ballVelocity: [0, 0, 0],
        isResetting: false,
        knockedPinsThisRoll: 0,
      }
    })
  }, [])

  return (
    <GameContext.Provider value={{ gameState, throwBall, resetPins, knockPin, onBallStop }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within GameProvider')
  }
  return context
}
