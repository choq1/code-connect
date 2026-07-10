import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { axe } from '../../../test/a11y'
import { FeedIcon } from '../../atoms/icons/Icons'
import { SidebarLink } from './SidebarLink'

describe('SidebarLink', () => {
  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    const { container } = render(
      <MemoryRouter>
        <SidebarLink to="/feed" icon={<FeedIcon />} label="Feed" />
      </MemoryRouter>,
    )

    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders the label and links to the given route', () => {
    render(
      <MemoryRouter>
        <SidebarLink to="/feed" icon={<FeedIcon />} label="Feed" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /feed/i })).toHaveAttribute(
      'href',
      '/feed',
    )
  })

  it('marks the link as active when the current route matches', () => {
    render(
      <MemoryRouter initialEntries={['/feed']}>
        <SidebarLink to="/feed" icon={<FeedIcon />} label="Feed" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /feed/i })).toHaveClass('text-text')
  })
})
