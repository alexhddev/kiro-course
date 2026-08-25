import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  it('renders a section element (Requirement 5.1: semantic HTML)', () => {
    const { container } = render(<HeroSection />);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('has the "hero" CSS class', () => {
    const { container } = render(<HeroSection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('hero');
  });

  it('displays the company name (Requirement 1.1)', () => {
    render(<HeroSection />);
    const heading = screen.getByRole('heading', { name: /EventsPro/i });
    expect(heading).toBeInTheDocument();
  });

  it('uses h1 for the company name (Requirement 5.3: appropriate heading hierarchy)', () => {
    render(<HeroSection />);
    const heading = screen.getByRole('heading', { name: /EventsPro/i });
    expect(heading.tagName).toBe('H1');
  });

  it('displays the tagline (Requirement 1.2)', () => {
    render(<HeroSection />);
    expect(screen.getByText(/Creating Memorable Experiences/i)).toBeInTheDocument();
  });

  it('applies the tagline class to the tagline text', () => {
    const { container } = render(<HeroSection />);
    const tagline = container.querySelector('.tagline');
    expect(tagline).toBeInTheDocument();
    expect(tagline?.textContent).toMatch(/Creating Memorable Experiences/i);
  });
});
