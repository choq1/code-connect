import { AuthTemplate } from '../../templates/AuthTemplate/AuthTemplate'
import { LoginForm, type LoginFormValues } from '../../organisms/LoginForm/LoginForm'
import { SocialLogin } from '../../organisms/SocialLogin/SocialLogin'

export function LoginPage() {
  function handleSubmit(values: LoginFormValues) {
    console.log('login submit', values)
  }

  return (
    <AuthTemplate bannerSrc="/banner.png" bannerAlt="Code Connect">
      <div>
        <h1 className="text-3xl font-bold text-text">Login</h1>
        <p className="mt-2 text-text-muted">Boas-vindas! Faça seu login.</p>
      </div>

      <LoginForm onSubmit={handleSubmit} />

      <SocialLogin />
    </AuthTemplate>
  )
}
