# Product

Awesome Pizza is a small REST API for a pizza shop. It lets customers browse the daily pizza menu and place orders, and lets staff look up and update those orders.

## Core capabilities

- **Daily menu**: Expose a fixed list of available pizzas with names, descriptions, and image URLs.
- **Orders**: Create orders, retrieve them by ID, and update them (sender, contents, and status).
- **Order lifecycle**: Orders move through the statuses `RECEIVED`, `DELIVERING`, `DELIVERED`, and `CANCELED`.
- **Auth**: A simple login endpoint issues a bearer token used to reach protected and admin-only endpoints.

## Scope notes

This is a demo/learning project. Data is stored in memory (no persistent database), and authentication uses hardcoded credentials and a static token. These are intentional simplifications, not production patterns — do not treat them as a security reference.
