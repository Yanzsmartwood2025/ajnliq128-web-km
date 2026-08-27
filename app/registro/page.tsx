import { AuthForm } from '@/components/auth-form'

export const metadata = {
  title: 'Crear cuenta — AJNLIQ128',
  description: 'Creá tu cuenta en FUEGO.',
}

export default function RegisterPage() {
  return <AuthForm mode="register" />
}
