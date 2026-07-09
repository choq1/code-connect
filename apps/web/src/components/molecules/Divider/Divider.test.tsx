import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '../../../test/a11y'
import { Divider } from './Divider'

describe('Divider', () => {
  it('renders its centered text', () => {
    render(<Divider>ou entre com outras contas</Divider>)
    expect(screen.getByText('ou entre com outras contas')).toBeInTheDocument()
  })

  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    const { container } = render(<Divider>ou entre com outras contas</Divider>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
