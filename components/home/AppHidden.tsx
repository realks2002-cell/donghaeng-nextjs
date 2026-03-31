'use client'

import { useState, useEffect } from 'react'
import { isNativeApp } from '@/lib/capacitor'

export default function AppHidden({ children }: { children: React.ReactNode }) {
  const [isApp, setIsApp] = useState(false)

  useEffect(() => {
    setIsApp(isNativeApp())
  }, [])

  if (isApp) return null

  return <>{children}</>
}
