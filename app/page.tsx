import { FloatingLines } from '@/components/ui/floating-lines'
import { FuegoHome } from '@/components/fuego-home'

export default function Page() {
  return (
    <div style={{ position: 'relative', zIndex: 0, backgroundColor: '#050507', minHeight: '100svh' }}>
      <FloatingLines />
      <FuegoHome />
    </div>
  )
}
