'use client'

import { usePathname } from 'next/navigation'
import ProgressBar from './ProgressBar'
import type { Step } from './types'

const STEP_MAP: Record<string, Step> = {
  '/requests/new/user-type': 1,
  '/requests/new/info': 1.5,
  '/requests/new/service': 2,
  '/requests/new/datetime': 3,
  '/requests/new/manager': 3.5,
  '/requests/new/details': 4,
  '/requests/new/payment': 5,
}

export default function ClientProgressBar() {
  const pathname = usePathname()
  const step = STEP_MAP[pathname] || 1
  return <ProgressBar currentStep={step} />
}
