import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Link } from './Link'

describe('Link', () => {
  it('renders its text and href', () => {
    render(<Link href="/recuperar-senha">Esqueci a senha</Link>)

    const link = screen.getByRole('link', { name: 'Esqueci a senha' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/recuperar-senha')
  })
})
