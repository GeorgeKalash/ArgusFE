import { useState, useEffect } from 'react'

export const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 100,
    height: typeof window !== 'undefined' ? window.innerHeight : 100
  }))

  useEffect(() => {
    const handleResize = () => {
      const { innerWidth, innerHeight } = window
      setWindowDimensions(prev => {
        if (prev.width === innerWidth && prev.height === innerHeight) {
          return prev
        }
        return { width: innerWidth, height: innerHeight }
      })
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  return windowDimensions
}
