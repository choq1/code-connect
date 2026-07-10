import { useState, type FormEvent } from 'react'
import type { CreatePostInput } from '../../../services/posts'
import { Button } from '../../atoms/Button/Button'
import { Label } from '../../atoms/Label/Label'
import { Textarea } from '../../atoms/Textarea/Textarea'
import { FormField } from '../../molecules/FormField/FormField'

interface PostFormProps {
  onSubmit: (values: CreatePostInput) => void
  submitError?: string
  isSubmitting?: boolean
}

interface FormErrors {
  title?: string
  description?: string
  code?: string
}

export function PostForm({ onSubmit, submitError, isSubmitting }: PostFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('')
  const [tags, setTags] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): FormErrors {
    const nextErrors: FormErrors = {}
    if (!title.trim()) nextErrors.title = 'Informe um título'
    if (!description.trim()) nextErrors.description = 'Informe uma descrição'
    if (!code.trim()) nextErrors.code = 'Cole o código do seu post'
    return nextErrors
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      code,
      language: language.trim() || undefined,
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      thumbnailUrl: thumbnailUrl.trim() || undefined,
    })
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <FormField
        label="Título"
        name="title"
        placeholder="Título do post"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        error={errors.title}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Sobre o que é este post?"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        {errors.description && (
          <span role="alert" className="text-sm text-danger">
            {errors.description}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="code">Código</Label>
        <Textarea
          id="code"
          name="code"
          rows={8}
          placeholder="Cole o trecho de código"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="font-mono"
        />
        {errors.code && (
          <span role="alert" className="text-sm text-danger">
            {errors.code}
          </span>
        )}
      </div>

      <FormField
        label="Linguagem (opcional)"
        name="language"
        placeholder="javascript, python, css..."
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
      />

      <FormField
        label="Tags (separadas por vírgula)"
        name="tags"
        placeholder="React, Front-end, Acessibilidade"
        value={tags}
        onChange={(event) => setTags(event.target.value)}
      />

      <FormField
        label="URL da thumbnail (opcional)"
        name="thumbnailUrl"
        placeholder="https://..."
        value={thumbnailUrl}
        onChange={(event) => setThumbnailUrl(event.target.value)}
      />

      {submitError && (
        <span role="alert" className="text-sm text-danger">
          {submitError}
        </span>
      )}

      <Button type="submit" disabled={isSubmitting} fullWidth={false} className="px-8">
        {isSubmitting ? 'Publicando...' : 'Publicar'}
      </Button>
    </form>
  )
}
