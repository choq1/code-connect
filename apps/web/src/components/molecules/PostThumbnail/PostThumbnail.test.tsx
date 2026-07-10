import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '../../../test/a11y'
import { PostThumbnail } from './PostThumbnail'

describe('PostThumbnail', () => {
  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    const { container } = render(
      <PostThumbnail thumbnailUrl={null} title="Meu post" />,
    )

    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders the image when a thumbnailUrl is provided', () => {
    render(<PostThumbnail thumbnailUrl="https://example.com/img.png" title="Meu post" />)

    const img = screen.getByRole('img', { name: /meu post/i })
    expect(img).toHaveAttribute('src', 'https://example.com/img.png')
  })

  it('renders a placeholder when there is no thumbnailUrl', () => {
    render(<PostThumbnail thumbnailUrl={null} title="Meu post" />)

    expect(
      screen.getByRole('img', { name: /sem thumbnail/i }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /^thumbnail/i })).not.toBeInTheDocument()
  })

  it('falls back to the placeholder when the image fails to load', () => {
    render(<PostThumbnail thumbnailUrl="https://example.com/broken.png" title="Meu post" />)

    const img = screen.getByRole('img', { name: /meu post/i })
    fireEvent.error(img)

    expect(screen.getByRole('img', { name: /sem thumbnail/i })).toBeInTheDocument()
  })
})
