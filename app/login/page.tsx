import { AuthForm } from '@/components/auth-form'

export const metadata = {
  title: 'Iniciar sesión — AJNLIQ128',
  description: 'Accedé a tu frecuencia en FUEGO.',
}

export default function LoginPage() {
  return <AuthForm mode="login" />
}
