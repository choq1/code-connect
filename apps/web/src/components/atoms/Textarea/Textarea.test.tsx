import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from '../../../test/a11y'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    const { container } = render(<Textarea aria-label="Descrição" />)

    expect(await axe(container)).toHaveNoViolations()
  })

  it('accepts typed input', async () => {
    const user = userEvent.setup()
    render(<Textarea aria-label="Descrição" />)

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Olá mundo')

    expect(textarea).toHaveValue('Olá mundo')
  })
})
