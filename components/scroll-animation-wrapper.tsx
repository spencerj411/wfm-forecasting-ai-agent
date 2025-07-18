"use client"

import { useRef, useState, useEffect, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ScrollAnimationWrapperProps {
  children: ReactNode
  className?: string
  animationType: "left" | "right"
}

export function ScrollAnimationWrapper({ children, className, animationType }: ScrollAnimationWrapperProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When the element is intersecting (coming into view) or not intersecting (going out of view)
          setIsVisible(entry.isIntersecting)
        })
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
      },
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  const animationClasses = {
    left: "reveal-from-left",
    right: "reveal-from-right",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "transition-transform-opacity",
        animationClasses[animationType],
        { "is-visible": isVisible },
        className,
      )}
    >
      {children}
    </div>
  )
}
