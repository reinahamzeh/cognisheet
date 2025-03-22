"use client"

import { useState, useRef, useEffect } from "react"

/**
 * Hook for creating resizable elements
 * 
 * @param {Object} options - Hook options
 * @param {string} options.direction - The resize direction ('horizontal' or 'vertical')
 * @param {number} options.initialSize - The initial size in pixels
 * @param {number} options.minSize - The minimum allowed size
 * @param {number} options.maxSize - The maximum allowed size
 * @returns {Object} Resizable properties and elements
 */
export function useResizable({ direction, initialSize = 100, minSize = 50, maxSize = 500 }) {
  const [size, setSize] = useState(initialSize)
  const [isResizing, setIsResizing] = useState(false)
  const resizableRef = useRef(null)
  const startPosRef = useRef(0)
  const startSizeRef = useRef(0)

  const startResize = (e) => {
    setIsResizing(true)
    startSizeRef.current = size

    if ("touches" in e) {
      startPosRef.current = direction === "horizontal" ? e.touches[0].clientX : e.touches[0].clientY
    } else {
      startPosRef.current = direction === "horizontal" ? e.clientX : e.clientY
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("touchmove", handleTouchMove)
    document.addEventListener("touchend", handleMouseUp)
  }

  const handleMouseMove = (e) => {
    if (!isResizing) return

    const currentPos = direction === "horizontal" ? e.clientX : e.clientY
    const delta = currentPos - startPosRef.current

    let newSize = startSizeRef.current + delta
    newSize = Math.max(minSize, Math.min(maxSize, newSize))

    setSize(newSize)
  }

  const handleTouchMove = (e) => {
    if (!isResizing) return

    const currentPos = direction === "horizontal" ? e.touches[0].clientX : e.touches[0].clientY
    const delta = currentPos - startPosRef.current

    let newSize = startSizeRef.current + delta
    newSize = Math.max(minSize, Math.min(maxSize, newSize))

    setSize(newSize)
  }

  const handleMouseUp = () => {
    setIsResizing(false)
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
    document.removeEventListener("touchmove", handleTouchMove)
    document.removeEventListener("touchend", handleMouseUp)
  }

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleMouseUp)
    }
  }, [])

  return {
    size,
    isResizing,
    resizableRef,
    resizeHandle: (
      <div
        onMouseDown={startResize}
        onTouchStart={startResize}
        className={`absolute ${
          direction === "horizontal"
            ? "cursor-col-resize top-0 right-0 w-1 h-full"
            : "cursor-row-resize bottom-0 left-0 h-1 w-full"
        } bg-transparent hover:bg-gray-400 z-10`}
      />
    ),
  }
} 