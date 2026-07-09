import { useState, type FormEvent } from 'react'
import { FormField } from '../../molecules/FormField/FormField'
import { Checkbox } from '../../atoms/Checkbox/Checkbox'
import { Label } from '../../atoms/Label/Label'
import { Link } from '../../atoms/Link/Link'
import { Button } from '../../atoms/Button/Button'

export interface LoginFormValues {
  identifier: string
  password: string
  remember: boolean
}

interface LoginFormProps {
  onSubmit?: (values: LoginFormValues) => void
}

interface FormErrors {
  identifier?: string
  password?: string
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): FormErrors {
    const nextErrors: FormErrors = {}
    if (!identifier.trim()) {
      nextErrors.identifier = 'Informe seu email ou usuário'
    }
    if (!password.trim()) {
      nextErrors.password = 'Informe sua senha'
    }
    return nextErrors
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length === 0) {
      onSubmit?.({ identifier, password, remember })
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <FormField
        label="Email ou usuário"
        name="identifier"
        placeholder="usuario123"
        value={identifier}
        onChange={(event) => setIdentifier(event.target.value)}
        error={errors.identifier}
      />
      <FormField
        label="Senha"
        name="password"
        type="password"
        placeholder="******"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
          <Label htmlFor="remember" className="cursor-pointer">
            Lembrar-me
          </Label>
        </div>
        <Link href="/recuperar-senha">Esqueci a senha</Link>
      </div>

      <Button type="submit">Login →</Button>
    </form>
  )
}
