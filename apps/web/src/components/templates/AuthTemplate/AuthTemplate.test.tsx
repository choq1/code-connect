import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthTemplate } from './AuthTemplate'

describe('AuthTemplate', () => {
  it('renders the banner and its children', () => {
    render(
      <AuthTemplate bannerSrc="/banner-login.png" bannerAlt="Login banner">
        <p>Formulário de login</p>
      </AuthTemplate>,
    )

    expect(screen.getByAltText('Login banner')).toHaveAttribute(
      'src',
      '/banner-login.png',
    )
    expect(screen.getByText('Formulário de login')).toBeInTheDocument()
  })
})
