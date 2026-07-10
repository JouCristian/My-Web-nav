# Product

## Register

product

## Users

This is a personal web hub for the site owner and invited users. It mixes navigation, learning utilities, team tools, dashboard surfaces, and small leisure modules used during work breaks.

## Product Purpose

The product gathers frequently used links, internal tools, and lightweight interactive modules in one Next.js site. Success means users can quickly enter the right area, understand whether a module is public or role-based, and use tools without exposing secrets or bypassing permissions.

## Brand Personality

Personal, experimental, focused. The site can shift visual registers by module when the intent is clear, but each surface should feel deliberate and usable rather than decorative.

## Anti-references

Avoid generic SaaS cards, oversized glassmorphism, purple-blue gradient templates, exposed secrets, production configuration edits, and UI changes that blur access boundaries.

## Design Principles

- Match the surface to the job: dashboards stay task-focused, experimental modules can adopt their own art direction.
- Make entry points obvious: modules should be discoverable from the home page without competing with core navigation.
- Preserve operational safety: do not leak environment values, service keys, or privileged actions into frontend code.
- Respect motion settings: animation should be brief, stateful, and compatible with reduced-motion preferences.
- Keep future extension simple: new modules should use clear data structures and isolated components.

## Accessibility & Inclusion

Target readable contrast, keyboard-visible focus states, semantic links and buttons, and `prefers-reduced-motion` support for animated UI.
