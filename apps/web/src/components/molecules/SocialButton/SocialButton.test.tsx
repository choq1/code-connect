import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SocialButton } from './SocialButton'

describe('SocialButton', () => {
  it('renders the icon and label', () => {
    render(<SocialButton icon="/Github.png" label="Github" />)

    const button = screen.getByRole('button', { name: 'Github' })
    expect(button.querySelector('img')).toHaveAttribute('src', '/Github.png')
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<SocialButton icon="/Google.png" label="Gmail" onClick={onClick} />)

    await user.click(screen.getByRole('button', { name: 'Gmail' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
