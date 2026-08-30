import { AuthForm } from '@/components/auth-form'
import { AnimatedGrain } from '@/components/ui/animated-grain'

export const metadata = {
  title: 'Iniciar sesión — AJNLIQ128',
  description: 'Accedé a tu frecuencia en FUEGO.',
}

export default function LoginPage() {
  return (
    <>
      <AnimatedGrain />
      <AuthForm mode="login" />
    </>
  )
}
