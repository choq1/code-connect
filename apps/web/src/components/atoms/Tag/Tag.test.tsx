import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '../../../test/a11y'
import { Tag } from './Tag'

describe('Tag', () => {
  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    const { container } = render(<Tag label="React" />)

    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders the label', () => {
    render(<Tag label="React" />)

    expect(screen.getByRole('button', { name: 'React' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()

    render(<Tag label="React" onClick={onClick} />)
    await user.click(screen.getByRole('button', { name: 'React' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
