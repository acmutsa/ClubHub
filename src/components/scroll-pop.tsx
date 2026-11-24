"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

type Props = {
  children: React.ReactNode
  className?: string
  /** Scale when the element is far from the middle of the screen. */
  min?: number
  /** Scale when the element is centered in the viewport. */
  max?: number
}

/**
 * Enlarges its children as they scroll toward the middle of the screen and shrinks them back as they leave.
 * Uses the individual `scale` CSS property, so it doesn't clash with `rotate-*` classes on the children.
 */
export function ScrollPop({ children, className, min = 0.94, max = 1.08 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let frame = 0
    const update = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      const viewport = window.innerHeight
      const distance = Math.abs(rect.top + rect.height / 2 - viewport / 2)
      const t = Math.max(0, 1 - distance / (viewport * 0.6)) // 1 when centered, 0 when far away
      el.style.scale = String(min + (max - min) * t)
      el.style.zIndex = t > 0.7 ? "10" : "0" // pop in front of neighbours
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [min, max])

  return (
    <div ref={ref} className={cn("relative transition-[scale] duration-200 ease-out will-change-transform", className)}>
      {children}
    </div>
  )
}