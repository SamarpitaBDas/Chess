import { useState, useRef, useCallback, useEffect } from 'react'

export function useTimer(initialWhite = 600, initialBlack = 600) {
  const [whiteTime, setWhiteTime] = useState(initialWhite)
  const [blackTime, setBlackTime] = useState(initialBlack)
  const [activeColor, setActiveColor] = useState('w')
  const intervalRef = useRef(null)
  const runningRef = useRef(false)

  const stopTimer = useCallback(() => {
    clearInterval(intervalRef.current)
    runningRef.current = false
  }, [])

  const startTimer = useCallback(() => {
    if (runningRef.current) return
    runningRef.current = true
    intervalRef.current = setInterval(() => {
      setActiveColor(c => {
        if (c === 'w') {
          setWhiteTime(t => Math.max(0, t - 1))
        } else {
          setBlackTime(t => Math.max(0, t - 1))
        }
        return c
      })
    }, 1000)
  }, [])

  const switchClock = useCallback(() => {
    setActiveColor(c => c === 'w' ? 'b' : 'w')
  }, [])

  const resetTimers = useCallback(() => {
    stopTimer()
    setWhiteTime(initialWhite)
    setBlackTime(initialBlack)
    setActiveColor('w')
  }, [initialWhite, initialBlack, stopTimer])

  // Cleanup
  useEffect(() => () => stopTimer(), [])

  return { whiteTime, blackTime, activeColor, startTimer, stopTimer, switchClock, resetTimers }
}
