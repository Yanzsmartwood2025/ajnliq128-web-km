import { BackgroundProvider } from '@/components/BackgroundManager'
import { FuegoHome } from '@/components/fuego-home'

export default function Page() {
  return (
    <BackgroundProvider>
      <div style={{ position: 'relative', zIndex: 0, backgroundColor: 'transparent', minHeight: '100svh' }}>
        <FuegoHome />
      </div>
    </BackgroundProvider>
  )
}
