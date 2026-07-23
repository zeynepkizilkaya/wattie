import { useCallback, useEffect, useRef, useState } from 'react'

interface PollingState {
  isStale: boolean
  consecutiveErrors: number
}

export function usePolling(
  callback: () => Promise<void> | void,
  intervalMs = 2000,
): PollingState {
  const savedCallback = useRef(callback)
  const runningRef = useRef(false)
  const mountedRef = useRef(true)
  const [state, setState] = useState<PollingState>({ isStale: false, consecutiveErrors: 0 })
  const errorsRef = useRef(0)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  const tick = useCallback(async () => {
    if (runningRef.current) return
    runningRef.current = true
    try {
      await savedCallback.current()
      errorsRef.current = 0
      if (mountedRef.current) setState({ isStale: false, consecutiveErrors: 0 })
    } catch {
      errorsRef.current++
      if (mountedRef.current) setState({ isStale: errorsRef.current >= 3, consecutiveErrors: errorsRef.current })
    } finally {
      runningRef.current = false
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    tick()
    const id = setInterval(tick, intervalMs)
    return () => {
      mountedRef.current = false
      clearInterval(id)
    }
  }, [intervalMs, tick])

  useEffect(() => {
    tick()
  }, [callback, tick])

  return state
}
