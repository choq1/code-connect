import { Divider } from '../../molecules/Divider/Divider'
import { SocialButton } from '../../molecules/SocialButton/SocialButton'
import { Link } from '../../atoms/Link/Link'

interface SocialLoginProps {
  onGithubClick?: () => void
  onGoogleClick?: () => void
  signupHref?: string
}

export function SocialLogin({
  onGithubClick,
  onGoogleClick,
  signupHref = '/cadastro',
}: SocialLoginProps) {
  return (
    <div className="flex flex-col gap-6">
      <Divider>ou entre com outras contas</Divider>

      <div className="flex justify-center gap-8">
        <SocialButton icon="/Github.png" label="Github" onClick={onGithubClick} />
        <SocialButton icon="/Google.png" label="Gmail" onClick={onGoogleClick} />
      </div>

      <p className="text-center text-sm text-text">
        Ainda não tem conta?{' '}
        <Link href={signupHref} className="text-brand no-underline">
          Crie seu cadastro!
        </Link>
      </p>
    </div>
  )
}
