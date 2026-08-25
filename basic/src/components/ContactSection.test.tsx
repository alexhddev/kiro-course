import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactSection } from './ContactSection';

describe('ContactSection', () => {
  it('renders a section element (Requirement 5.1: semantic HTML)', () => {
    const { container } = render(<ContactSection />);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('has the "contact" CSS class', () => {
    const { container } = render(<ContactSection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('contact');
  });

  it('renders "Contact Us" heading (Requirement 3.2)', () => {
    render(<ContactSection />);
    const heading = screen.getByRole('heading', { name: /contact us/i });
    expect(heading).toBeInTheDocument();
  });

  it('uses h2 for the heading (Requirement 5.3: appropriate heading hierarchy)', () => {
    render(<ContactSection />);
    const heading = screen.getByRole('heading', { name: /contact us/i });
    expect(heading.tagName).toBe('H2');
  });

  it('displays an email address (Requirement 3.3)', () => {
    render(<ContactSection />);
    const emailLink = screen.getByRole('link', { name: /info@eventspro.com/i });
    expect(emailLink).toBeInTheDocument();
  });

  it('email link has correct mailto href', () => {
    render(<ContactSection />);
    const emailLink = screen.getByRole('link', { name: /info@eventspro.com/i });
    expect(emailLink).toHaveAttribute('href', 'mailto:info@eventspro.com');
  });

  it('displays a phone number (Requirement 3.4)', () => {
    render(<ContactSection />);
    const phoneLink = screen.getByRole('link', { name: /\+1 \(555\) 123-4567/i });
    expect(phoneLink).toBeInTheDocument();
  });

  it('phone link has correct tel href', () => {
    render(<ContactSection />);
    const phoneLink = screen.getByRole('link', { name: /\+1 \(555\) 123-4567/i });
    expect(phoneLink).toHaveAttribute('href', 'tel:+15551234567');
  });
});
