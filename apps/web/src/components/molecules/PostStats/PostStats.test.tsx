import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '../../../test/a11y'
import { PostStats } from './PostStats'

describe('PostStats', () => {
  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    const { container } = render(
      <PostStats likeCount={2} commentCount={1} likedByMe={false} canInteract />,
    )

    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders like and comment counts', () => {
    render(<PostStats likeCount={12} commentCount={3} likedByMe={false} canInteract />)

    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('disables the like button when the user cannot interact', () => {
    render(
      <PostStats likeCount={0} commentCount={0} likedByMe={false} canInteract={false} />,
    )

    expect(screen.getByTitle('Faça login para curtir')).toBeDisabled()
  })

  it('calls onToggleLike when a logged-in user clicks the like button', async () => {
    const onToggleLike = vi.fn()
    const user = userEvent.setup()

    render(
      <PostStats
        likeCount={0}
        commentCount={0}
        likedByMe={false}
        canInteract
        onToggleLike={onToggleLike}
      />,
    )

    await user.click(screen.getByTitle('Curtir'))

    expect(onToggleLike).toHaveBeenCalledTimes(1)
  })

  it('marks the like button as pressed when likedByMe is true', () => {
    render(<PostStats likeCount={1} commentCount={0} likedByMe canInteract />)

    expect(screen.getByTitle('Descurtir')).toHaveAttribute('aria-pressed', 'true')
  })
})
