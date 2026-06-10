# Product

## Register

product

## Users

Two overlapping profiles:

1. **Beekeeper (primary)** — owns the hives, checks the dashboard on mobile or tablet while in the field. Wants to know at a glance: which hives need attention, what the temperature and battery look like, and whether any alerts fired overnight. Not technical; acts on urgency.

2. **Technical operator / admin** — sets up the IoT hardware, manages gateway settings, reviews historical data and reports on desktop. Comfortable with data-dense screens; cares about reliability signals and system health.

Both share the same app. The main dashboard and hive detail views serve the beekeeper; settings, system health, and reports serve the operator. Neither should feel excluded.

## Product Purpose

BeeMora is a real-time IoT monitoring dashboard for beehive arrays. Sensors report temperature, humidity, battery, weight, and sound data from each hive over WiFi to a Node.js gateway; the React frontend displays live status, alerts, historical trends, an AI analysis panel, a map view, and reports. Success means a beekeeper can spot a problem hive in under 5 seconds without reading a table.

## Brand Personality

Grounded, precise, alive. Three words: **reliable, natural, attentive**.

Not cold, not corporate. The product lives at the intersection of nature and electronics — warm enough to match the subject (bees, outdoors, craft), sharp enough to be trusted with real sensor data. The tone never condescends to the beekeeper, and never intimidates them with industrial UI.

## Anti-references

- **Generic SaaS dashboard** (Vercel, Linear, Stripe aesthetic): teal-purple gradients, hero-metric card grids, identical icon+heading+text cards repeated to fill space. BeeMora must read as purposeful, not templated.
- **Heavy industrial SCADA / factory HMI**: pixel-heavy tables, dense grid overlays, 1990s control-panel aesthetics. It should feel like a considered product, not a monitoring console.

## Design Principles

1. **Five-second triage** — critical hive status must be identifiable from any screen without reading labels. Color, shape, and hierarchy carry urgency before text does.
2. **Field-tested warmth** — the amber/honey accent is intentional, not decorative. Brand warmth lives in color and typography rhythm, not in soft blur or glass cards.
3. **Both hands occupied** — mobile beekeeper use is real. Touch targets, readable contrast in outdoor light, and minimal tap depth matter.
4. **Honest data density** — show what the data is, not what looks impressive. No metric theatrics; number + unit + trend is sufficient.
5. **Quiet until urgent** — the UI rests in neutral. Alerts break through with contrast and motion, not by making the resting state noisy.

## Accessibility & Inclusion

Baseline: good color contrast (minimum 4.5:1 body text, 3:1 large text), no information conveyed by color alone (status badges carry text or icons), color-blindness-safe status palette. Full WCAG 2.1 AA certification is not required but contrast targets are non-negotiable.
