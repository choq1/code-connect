import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthTemplate } from '../../templates/AuthTemplate/AuthTemplate'
import { LoginForm, type LoginFormValues } from '../../organisms/LoginForm/LoginForm'
import { SocialLogin } from '../../organisms/SocialLogin/SocialLogin'
import { getAuthErrorMessage, login } from '../../../services/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(values: LoginFormValues) {
    setSubmitError(undefined)
    setIsSubmitting(true)
    try {
      await login({ email: values.identifier, password: values.password })
      navigate('/feed')
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthTemplate
      bannerSrc="/banner-login.jpg"
      bannerAlt="Code Connect"
      bannerWidth={814}
      bannerHeight={1272}
    >
      <div>
        <h1 className="text-3xl font-semibold text-text">Login</h1>
        <p className="mt-2 text-xl text-text">Boas-vindas! Faça seu login.</p>
      </div>

      <LoginForm onSubmit={handleSubmit} submitError={submitError} isSubmitting={isSubmitting} />

      <SocialLogin />
    </AuthTemplate>
  )
}
