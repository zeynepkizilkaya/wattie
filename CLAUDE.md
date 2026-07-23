# Wattie Web App — Agent Context

## What This Is

This repo is the **Wattie Web App**: a React SPA dashboard that monitors real-time household electricity consumption. It polls a Spring Boot backend every 1–2 seconds and visualizes live IoT telemetry data.

Full project spec: `docs/spec.md`  
Full design system: `docs/DESIGN-ibm.md`

---

## Design System — IBM Carbon

Apply these rules on every component. Do not deviate.

**Colors:**
- Primary accent (CTAs, links, focus): `#0f62fe`
- Body text: `#161616`
- Muted text: `#525252`
- Canvas: `#ffffff`
- Surface alt: `#f4f4f4`
- Hairline border: `#e0e0e0`
- Success: `#24a148` | Warning: `#f1c21b` | Error: `#da1e28`

**Typography — IBM Plex Sans only:**
- Display (42px+): weight 300
- Body (16px): weight 400, `letter-spacing: 0.16px`
- Emphasis: weight 600
- Buttons/captions (14px): weight 400, `letter-spacing: 0.16px`

**Shape:** `border-radius: 0` everywhere — buttons, cards, inputs, modals. No exceptions.

**Elevation:** No drop shadows. Use `1px #e0e0e0` hairline borders for cards. Use `#f4f4f4` background for alternate surfaces.

**Buttons:**
- Primary: `bg #0f62fe`, white text, 0px radius, `padding: 12px 16px`
- Secondary: `bg #161616`, white text
- Tertiary: white bg, `#0f62fe` text + `1px #0f62fe` border
- Ghost: transparent bg, `#0f62fe` text

**Cards:** `1px #e0e0e0` border, `padding: 24px`, `border-radius: 0`, white bg (or `#f4f4f4` for elevated).

**Inputs:** `bg #f4f4f4`, `border-radius: 0`, focus = `2px #0f62fe` bottom underline (not full border).

---

## UI Requirements

### Dashboard Grid
- Grid/list of all registered homes
- Each home card shows: home name, current billing status, quota usage
- Homes that breached quota → distinct visual state (use `semantic-warning` at 80%, `semantic-error` at 100%)

### Home Detail Modal
- Opens on card click
- Shows real-time metrics for all appliances
- Appliances with anomalous status (3 consecutive breaches) → distinct visual treatment (red/error state)
- Charts below appliance list: daily historical energy consumption trend (use a charting library)

### Non-Functional (enforce these in all implementations)
- Polling every 1–2 seconds must not cause UI freeze, layout shift, or input lag
- Show skeleton loaders / spinners during any network-bound operation
- Never expose raw errors or stack traces to the user — toast/alert only

---

## API

Base URL from env: `VITE_API_BASE_URL`

| Method | Path | Data Source | Purpose |
|---|---|---|---|
| POST | `/homes` | PostgreSQL + Kafka | Register home + appliances |
| GET | `/homes` | Apache Ignite | Live dashboard poll (1–2s) |
| GET | `/homes/:id/history` | PostgreSQL | Chart data (daily trends) |

Live reads come from Apache Ignite (sub-ms latency). Historical reads come from PostgreSQL.

---

## Business Logic for UI State

```
quota usage < 80%   → normal state
quota usage >= 80%  → warning state (trigger: alert was sent)
quota usage >= 100% → breach state (penalty tariff active, billing rate increases)

appliance consecutive_breaches >= 3 → anomalous (mark distinctly)
appliance consecutive_breaches reset to 0 → back to normal
```

---

## Project Rules

- All config via env vars — no hardcoded URLs or keys
- Clean component structure — one responsibility per component
- All errors caught and shown as user-friendly toasts, never raw exceptions
