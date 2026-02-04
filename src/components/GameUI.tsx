import { useGame } from '../context/GameContext'
import { useState, useEffect } from 'react'

interface GameUIProps {
  onReset: () => void
}

export function GameUI({ onReset }: GameUIProps) {
  const { gameState } = useGame()
  const [showInstructions, setShowInstructions] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowInstructions(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  const knockedCount = gameState.pins.filter((p) => p.knocked).length

  return (
    <>
      {/* Score display - top center */}
      <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/60 backdrop-blur-xl border border-pink-500/30 rounded-2xl px-6 py-4 md:px-10 md:py-5">
          <div className="flex items-center gap-6 md:gap-10">
            <div className="text-center">
              <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-outfit mb-1">
                Frame
              </p>
              <p className="text-2xl md:text-4xl font-bowlby text-white">
                {gameState.currentFrame + 1}
                <span className="text-white/30">/10</span>
              </p>
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-pink-500/50 to-transparent" />
            <div className="text-center">
              <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-pink-400/80 font-outfit mb-1">
                Score
              </p>
              <p className="text-3xl md:text-5xl font-bowlby bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                {gameState.totalScore}
              </p>
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent" />
            <div className="text-center">
              <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-outfit mb-1">
                Pins
              </p>
              <p className="text-2xl md:text-4xl font-bowlby text-white">
                {knockedCount}
                <span className="text-white/30">/10</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Roll indicator */}
      <div className="absolute top-24 md:top-28 left-1/2 -translate-x-1/2 z-10">
        <div className="flex gap-2">
          {[0, 1].map((roll) => (
            <div
              key={roll}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                gameState.currentRoll === roll
                  ? 'bg-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.8)]'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Instructions overlay */}
      {showInstructions && !gameState.isRolling && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-black/70 backdrop-blur-xl border border-cyan-500/30 rounded-3xl px-8 py-6 md:px-12 md:py-8 text-center animate-pulse">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-2 border-dashed border-pink-500/50 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
              <svg
                className="w-full h-full text-cyan-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 11l5-5m0 0l5 5m-5-5v12"
                />
              </svg>
            </div>
            <p className="font-bowlby text-xl md:text-2xl text-white mb-2">
              Drag to Bowl
            </p>
            <p className="font-outfit text-sm text-white/60">
              Pull back and release to throw
            </p>
          </div>
        </div>
      )}

      {/* Status indicator */}
      {gameState.isRolling && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
          <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md rounded-full px-6 py-3">
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-ping" />
            <p className="font-outfit text-sm text-white/80 uppercase tracking-wider">
              Rolling...
            </p>
          </div>
        </div>
      )}

      {/* Strike/Spare celebration */}
      {knockedCount === 10 && !gameState.isRolling && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="text-center animate-bounce">
            <p className="font-bowlby text-6xl md:text-8xl bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(236,72,153,0.5)]">
              {gameState.currentRoll === 0 ? 'STRIKE!' : 'SPARE!'}
            </p>
            <div className="flex justify-center gap-2 mt-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reset button - bottom right */}
      <button
        onClick={onReset}
        disabled={gameState.isRolling}
        className="absolute bottom-16 md:bottom-12 right-4 md:right-8 z-10
          bg-gradient-to-r from-pink-600 to-pink-500
          hover:from-pink-500 hover:to-cyan-500
          disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed
          text-white font-outfit font-semibold text-sm md:text-base
          px-6 py-3 md:px-8 md:py-4 rounded-full
          transition-all duration-300 transform hover:scale-105
          shadow-[0_0_20px_rgba(236,72,153,0.4)]
          hover:shadow-[0_0_30px_rgba(236,72,153,0.6)]
          active:scale-95"
      >
        Reset Pins
      </button>

      {/* Frame history - bottom left (hidden on small mobile) */}
      <div className="hidden md:block absolute bottom-12 left-8 z-10">
        <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-[0.15em] text-cyan-400/60 font-outfit mb-3">
            Frame History
          </p>
          <div className="flex gap-1">
            {gameState.frames.slice(0, 10).map((frame, i) => (
              <div
                key={i}
                className={`w-8 h-10 rounded flex flex-col items-center justify-center text-xs font-outfit
                  ${
                    i === gameState.currentFrame
                      ? 'bg-pink-500/30 border border-pink-500'
                      : 'bg-white/5 border border-white/10'
                  }`}
              >
                <span className="text-white/40 text-[8px]">{i + 1}</span>
                <span className="text-white">
                  {frame.roll1 !== null
                    ? frame.roll1 === 10
                      ? 'X'
                      : frame.roll1
                    : '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile frame indicator */}
      <div className="md:hidden absolute bottom-16 left-4 z-10">
        <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/20 rounded-lg px-3 py-2">
          <p className="text-[8px] uppercase tracking-wider text-cyan-400/60 font-outfit">
            Roll {gameState.currentRoll + 1}
          </p>
        </div>
      </div>
    </>
  )
}
