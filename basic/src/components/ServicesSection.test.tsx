import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ServicesSection } from './ServicesSection';

describe('ServicesSection', () => {
  it('renders a section element (Requirement 5.1: semantic HTML)', () => {
    const { container } = render(<ServicesSection />);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('has the "services" CSS class', () => {
    const { container } = render(<ServicesSection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('services');
  });

  it('renders "Our Services" heading (Requirement 2.2)', () => {
    render(<ServicesSection />);
    const heading = screen.getByRole('heading', { name: /our services/i });
    expect(heading).toBeInTheDocument();
  });

  it('uses h2 for the heading (Requirement 5.3: appropriate heading hierarchy)', () => {
    render(<ServicesSection />);
    const heading = screen.getByRole('heading', { name: /our services/i });
    expect(heading.tagName).toBe('H2');
  });

  it('displays at least three event types (Requirement 2.3)', () => {
    const { container } = render(<ServicesSection />);
    const listItems = container.querySelectorAll('ul > li');
    expect(listItems.length).toBeGreaterThanOrEqual(3);
  });

  it('displays "Corporate Events" service', () => {
    render(<ServicesSection />);
    expect(screen.getByText('Corporate Events')).toBeInTheDocument();
  });

  it('displays "Weddings" service', () => {
    render(<ServicesSection />);
    expect(screen.getByText('Weddings')).toBeInTheDocument();
  });

  it('displays "Private Parties" service', () => {
    render(<ServicesSection />);
    expect(screen.getByText('Private Parties')).toBeInTheDocument();
  });

  it('renders services in an unordered list', () => {
    const { container } = render(<ServicesSection />);
    const ul = container.querySelector('ul');
    expect(ul).toBeInTheDocument();
    expect(ul?.children.length).toBe(3);
  });
});
