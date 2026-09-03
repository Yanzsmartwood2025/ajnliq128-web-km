import { BackgroundProvider } from '@/components/BackgroundManager'
import { FuegoHome } from '@/components/fuego-home'
import { Suspense } from 'react'

export default function Page() {
  return (
    <BackgroundProvider>
      <div style={{ position: 'relative', zIndex: 0, backgroundColor: 'transparent', minHeight: '100svh' }}>
        <Suspense fallback={<div>Cargando...</div>}>
          <FuegoHome />
        </Suspense>
      </div>
    </BackgroundProvider>
  )
}
