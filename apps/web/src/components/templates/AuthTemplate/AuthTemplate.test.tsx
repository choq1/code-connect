import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '../../../test/a11y'
import { AuthTemplate } from './AuthTemplate'

describe('AuthTemplate', () => {
  it('renders the banner and its children', () => {
    render(
      <AuthTemplate
        bannerSrc="/banner-login.jpg"
        bannerAlt="Login banner"
        bannerWidth={814}
        bannerHeight={1272}
      >
        <p>Formulário de login</p>
      </AuthTemplate>,
    )

    expect(screen.getByAltText('Login banner')).toHaveAttribute(
      'src',
      '/banner-login.jpg',
    )
    expect(screen.getByText('Formulário de login')).toBeInTheDocument()
  })

  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    const { container } = render(
      <AuthTemplate
        bannerSrc="/banner-login.jpg"
        bannerAlt="Login banner"
        bannerWidth={814}
        bannerHeight={1272}
      >
        <p>Formulário de login</p>
      </AuthTemplate>,
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
