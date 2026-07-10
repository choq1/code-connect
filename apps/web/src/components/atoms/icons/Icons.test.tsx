import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  ChatIcon,
  CloseIcon,
  CodeIcon,
  FeedIcon,
  InfoIcon,
  LoginIcon,
  LogoutIcon,
  ProfileIcon,
  SearchIcon,
  ShareIcon,
} from './Icons'

const icons = [
  ['FeedIcon', FeedIcon],
  ['ProfileIcon', ProfileIcon],
  ['InfoIcon', InfoIcon],
  ['LoginIcon', LoginIcon],
  ['LogoutIcon', LogoutIcon],
  ['CodeIcon', CodeIcon],
  ['ShareIcon', ShareIcon],
  ['ChatIcon', ChatIcon],
  ['SearchIcon', SearchIcon],
  ['CloseIcon', CloseIcon],
] as const

describe('Icons', () => {
  it.each(icons)('renders %s as a decorative, hidden svg', (_name, IconComponent) => {
    const { container } = render(<IconComponent />)
    const svg = container.querySelector('svg')

    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('forwards a custom className to the svg element', () => {
    const { container } = render(<FeedIcon className="size-8" />)

    expect(container.querySelector('svg')).toHaveClass('size-8')
  })
})
