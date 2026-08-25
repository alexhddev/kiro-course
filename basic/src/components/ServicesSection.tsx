import React from 'react';

/**
 * ServicesSection Component
 * 
 * Displays the types of events the company organizes.
 * 
 * Requirements:
 * - 2.1: Display Services_Section below Hero_Section
 * - 2.2: Contains heading labeled "Our Services"
 * - 2.3: Lists at least three event types
 * - 5.1: Uses semantic HTML elements
 * - 5.3: Uses appropriate heading hierarchy (h2)
 */
export const ServicesSection: React.FC = () => {
  return (
    <section className="services">
      <h2>Our Services</h2>
      <ul>
        <li>Corporate Events</li>
        <li>Weddings</li>
        <li>Private Parties</li>
      </ul>
    </section>
  );
};
