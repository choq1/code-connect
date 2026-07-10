import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthTemplate } from '../../templates/AuthTemplate/AuthTemplate'
import { SignupForm, type SignupFormValues } from '../../organisms/SignupForm/SignupForm'
import { SocialLogin } from '../../organisms/SocialLogin/SocialLogin'
import { getAuthErrorMessage, login, register } from '../../../services/auth'

export function SignupPage() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(values: SignupFormValues) {
    setSubmitError(undefined)
    setIsSubmitting(true)
    try {
      await register({ name: values.name, email: values.email, password: values.password })
      await login({ email: values.email, password: values.password })
      navigate('/feed')
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthTemplate
      bannerSrc="/banner.jpg"
      bannerAlt="Code Connect"
      bannerWidth={814}
      bannerHeight={1350}
    >
      <div>
        <h1 className="text-3xl font-semibold text-text">Cadastro</h1>
        <p className="mt-2 text-xl text-text">Olá! Preencha seus dados.</p>
      </div>

      <SignupForm onSubmit={handleSubmit} submitError={submitError} isSubmitting={isSubmitting} />

      <SocialLogin
        promptText="Já tem conta?"
        linkLabel="Faça seu login!"
        signupHref="/login"
      />
    </AuthTemplate>
  )
}
