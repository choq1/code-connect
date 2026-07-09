import { AuthTemplate } from '../../templates/AuthTemplate/AuthTemplate'
import { SignupForm, type SignupFormValues } from '../../organisms/SignupForm/SignupForm'
import { SocialLogin } from '../../organisms/SocialLogin/SocialLogin'

export function SignupPage() {
  function handleSubmit(values: SignupFormValues) {
    console.log('signup submit', values)
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

      <SignupForm onSubmit={handleSubmit} />

      <SocialLogin
        promptText="Já tem conta?"
        linkLabel="Faça seu login!"
        signupHref="/login"
      />
    </AuthTemplate>
  )
}
