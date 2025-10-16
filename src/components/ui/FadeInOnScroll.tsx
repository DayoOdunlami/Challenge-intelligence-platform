'use client'

import { useState, useEffect, useRef, ReactNode } from 'react'

interface FadeInOnScrollProps {
  children: ReactNode
  delay?: number
  className?: string
  threshold?: number
}

export default function FadeInOnScroll({ 
  children, 
  delay = 0, 
  className = '', 
  threshold = 0.1 
}: FadeInOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay, threshold])

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  )
}