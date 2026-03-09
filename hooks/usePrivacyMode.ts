'use client'
import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'

export function usePrivacyMode() {
  const [isPrivate, setIsPrivate] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('admin-privacy-mode')
    if (saved !== null) setIsPrivate(saved === 'true')
  }, [])

  const toggle = () => {
    setIsPrivate(prev => {
      localStorage.setItem('admin-privacy-mode', String(!prev))
      return !prev
    })
  }

  const blurStyle: CSSProperties = isPrivate
    ? { filter: 'blur(4px)', userSelect: 'none' }
    : {}

  return { isPrivate, toggle, blurStyle }
}
