import { AuthForm } from '@/components/auth-form'
import { AnimatedGrain } from '@/components/ui/animated-grain'

export const metadata = {
  title: 'Crear cuenta — AJNLIQ128',
  description: 'Creá tu cuenta en FUEGO.',
}

export default function RegisterPage() {
  return (
    <>
      <AnimatedGrain />
      <AuthForm mode="register" />
    </>
  )
}
