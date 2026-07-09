import { useState, type FormEvent } from 'react'
import { FormField } from '../../molecules/FormField/FormField'
import { Checkbox } from '../../atoms/Checkbox/Checkbox'
import { Label } from '../../atoms/Label/Label'
import { Button } from '../../atoms/Button/Button'

export interface SignupFormValues {
  name: string
  email: string
  password: string
  remember: boolean
}

interface SignupFormProps {
  onSubmit?: (values: SignupFormValues) => void
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
}

export function SignupForm({ onSubmit }: SignupFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): FormErrors {
    const nextErrors: FormErrors = {}
    if (!name.trim()) {
      nextErrors.name = 'Informe seu nome completo'
    }
    if (!email.trim()) {
      nextErrors.email = 'Informe seu email'
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
      onSubmit?.({ name, email, password, remember })
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <FormField
        label="Nome"
        name="name"
        placeholder="Nome completo"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={errors.name}
      />
      <FormField
        label="Email"
        name="email"
        type="email"
        placeholder="Digite seu email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
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

      <Button type="submit">Cadastrar →</Button>
    </form>
  )
}
