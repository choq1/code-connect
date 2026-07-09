import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('renders unchecked by default', () => {
    render(<Checkbox aria-label="Lembrar-me" />)
    expect(screen.getByRole('checkbox', { name: 'Lembrar-me' })).not.toBeChecked()
  })

  it('toggles when clicked', async () => {
    const user = userEvent.setup()
    render(<Checkbox aria-label="Lembrar-me" defaultChecked={false} />)

    const checkbox = screen.getByRole('checkbox', { name: 'Lembrar-me' })
    await user.click(checkbox)

    expect(checkbox).toBeChecked()
  })
})
