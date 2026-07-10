import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthErrorMessage } from '../../../services/auth'
import { createPost, type CreatePostInput } from '../../../services/posts'
import { PostForm } from '../../organisms/PostForm/PostForm'
import { AppShell } from '../../templates/AppShell/AppShell'

export function CreatePostPage() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(values: CreatePostInput) {
    setSubmitError(undefined)
    setIsSubmitting(true)
    try {
      const post = await createPost(values)
      navigate(`/posts/${post.id}`)
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-semibold text-text">Publicar</h1>

        <div className="max-w-2xl rounded-lg bg-card p-6">
          <PostForm
            onSubmit={handleSubmit}
            submitError={submitError}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </AppShell>
  )
}
