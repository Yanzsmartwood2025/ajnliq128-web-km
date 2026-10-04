import { BackgroundProvider } from '@/components/BackgroundManager'
import { ShowTour } from '@/components/show-tour'

export default function ShowPage() {
  return (
    <BackgroundProvider>
      <ShowTour />
    </BackgroundProvider>
  )
}
