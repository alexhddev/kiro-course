import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

/**
 * Integration tests for the Events Company Home Page
 * 
 * Note: Responsive behavior (Requirement 6) is implemented via CSS media queries
 * in App.css and would typically be verified through E2E tests or visual regression
 * testing tools rather than unit tests.
 */
describe('App Integration Tests', () => {
  it('renders all main sections in the correct order', () => {
    const { container } = render(<App />);
    const sections = container.querySelectorAll('section, footer');
    
    expect(sections.length).toBe(4);
    expect(sections[0]).toHaveClass('hero');
    expect(sections[1]).toHaveClass('services');
    expect(sections[2]).toHaveClass('contact');
    expect(sections[3].tagName).toBe('FOOTER');
  });

  it('displays company identity in hero section (Requirement 1)', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /EventsPro/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Creating Memorable Experiences/i)).toBeInTheDocument();
  });

  it('displays services section (Requirement 2)', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /our services/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByText('Corporate Events')).toBeInTheDocument();
    expect(screen.getByText('Weddings')).toBeInTheDocument();
    expect(screen.getByText('Private Parties')).toBeInTheDocument();
  });

  it('displays contact information (Requirement 3)', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /contact us/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /info@eventspro.com/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /\+1 \(555\) 123-4567/i })).toBeInTheDocument();
  });

  it('displays footer information (Requirement 4)', () => {
    const { container } = render(<App />);
    const currentYear = new Date().getFullYear();
    const footer = container.querySelector('footer');
    
    expect(footer).toBeInTheDocument();
    expect(footer?.textContent).toMatch(new RegExp(currentYear.toString()));
    expect(footer?.textContent).toMatch(/EventsPro/i);
    expect(footer?.textContent).toMatch(/all rights reserved/i);
  });

  it('uses semantic HTML elements (Requirement 5.1)', () => {
    const { container } = render(<App />);
    expect(container.querySelectorAll('section').length).toBe(3);
    expect(container.querySelector('footer')).toBeInTheDocument();
  });

  it('maintains proper heading hierarchy (Requirement 5.3)', () => {
    render(<App />);
    const h1 = screen.getByRole('heading', { level: 1 });
    const h2Headings = screen.getAllByRole('heading', { level: 2 });
    
    expect(h1).toBeInTheDocument();
    expect(h2Headings.length).toBe(2); // "Our Services" and "Contact Us"
  });
});
