'use client'

import { RouteErrorState } from '@/components/route-error-state'

export default function AriaError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteErrorState reset={reset} label="ARIA" />
}
