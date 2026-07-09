import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Label } from './Label'

describe('Label', () => {
  it('renders its text and associates with a field via htmlFor', () => {
    render(
      <>
        <Label htmlFor="email">Email ou usuário</Label>
        <input id="email" />
      </>,
    )

    expect(screen.getByLabelText('Email ou usuário')).toBeInTheDocument()
  })
})
