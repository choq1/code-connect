import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '../../../test/a11y'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    const { container } = render(<SearchBar value="" onSearch={vi.fn()} />)

    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders the current value', () => {
    render(<SearchBar value="react" onSearch={vi.fn()} />)

    expect(screen.getByRole('searchbox')).toHaveValue('react')
  })

  it('calls onSearch with the typed value after the debounce', async () => {
    const onSearch = vi.fn()
    const user = userEvent.setup()

    render(<SearchBar value="" onSearch={onSearch} debounceMs={10} />)

    await user.type(screen.getByRole('searchbox'), 'react')

    await vi.waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('react')
    })
  })
})
