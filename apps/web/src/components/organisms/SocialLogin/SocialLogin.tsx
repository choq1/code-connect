import { Divider } from '../../molecules/Divider/Divider'
import { SocialButton } from '../../molecules/SocialButton/SocialButton'
import { Link } from '../../atoms/Link/Link'

interface SocialLoginProps {
  onGithubClick?: () => void
  onGoogleClick?: () => void
  signupHref?: string
  promptText?: string
  linkLabel?: string
}

export function SocialLogin({
  onGithubClick,
  onGoogleClick,
  signupHref = '/cadastro',
  promptText = 'Ainda não tem conta?',
  linkLabel = 'Crie seu cadastro!',
}: SocialLoginProps) {
  return (
    <div className="flex flex-col gap-6">
      <Divider>ou entre com outras contas</Divider>

      <div className="flex justify-center gap-8">
        <SocialButton icon="/Github.png" label="Github" onClick={onGithubClick} />
        <SocialButton icon="/Google.png" label="Gmail" onClick={onGoogleClick} />
      </div>

      <p className="text-center text-lg text-text">
        {promptText}{' '}
        <Link to={signupHref} className="text-brand no-underline">
          {linkLabel}
        </Link>
      </p>
    </div>
  )
}
