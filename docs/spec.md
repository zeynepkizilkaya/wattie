# VoltWise Project Spec

## Overview

**VoltWise** is a real-time IoT energy analytics and budget auditing platform for monitoring household electricity consumption. It processes continuous data streams from smart home appliances, giving users visibility into power metrics and utility costs.

The platform tracks accumulated energy usage and financial spend against predefined quotas. Upon breaching the 100% budget threshold, it enforces a premium penalty tariff. When quota breaches or device anomalies are detected, it dispatches AI-generated personalized email alerts (via Google Gemini) in Turkish.

---

## Architecture

```
VoltWise Web App (SPA)
        ↓
  VoltWise Core (Spring Boot)
   ↙       ↓          ↓        ↘
Kafka   PostgreSQL  Apache    Google
                    Ignite    Gemini
  ↑
VoltWise Telemetry Sensors
```

**Components:**
- **VoltWise Web App** — React SPA dashboard (this repo)
- **VoltWise Core** — Spring Boot monolith; telemetry processing, billing rules, LLM pipeline
- **VoltWise Telemetry Sensors** — Background simulation engine mocking IoT appliances via Kafka
- **Apache Kafka** — Bidirectional event broker (registration topic + telemetry topic)
- **Apache Ignite** — In-memory data grid (IMDG) for live state tracking, sub-millisecond latency
- **PostgreSQL** — Persistent store for registries, billing history, audit trails, LLM recommendations
- **Google Gemini** — LLM for generating personalized Turkish-language energy-saving alerts

---

## 5.1 VoltWise Web App Requirements

### Functional Requirements

**Real-Time Dashboard Grid**
- Display a grid/list of all registered residential structures
- Clicking a home card opens a modal with real-time consumption metrics for all appliances + cumulative billing info

**Dynamic Quota Breach & Anomaly Identification**
- Visually differentiate homes that have breached power or financial budget quotas on the main dashboard
- Inside the home modal, appliances with anomalous metrics or consecutive threshold violations must have distinct visual treatment

**Interactive Analytical Charts**
- Render periodic charts per residential structure using a visualization library
- Charts embedded inside the home modal, below the appliance list
- Show daily historical energy consumption trends based on incoming telemetry packets

### Non-Functional Requirements

**UI Fluidity During Aggressive Polling**
- Must remain fully interactive during 1–2 second polling intervals
- DOM and chart updates must not cause freezing, layout shifts, or input lag

**Asynchronous Loading Indication**
- Display skeleton components or spinners during network-bound operations
- Required for live analytical data streams

**Graceful Client-Side Error Interception**
- Intercept and handle errors from network drops or backend validation failures
- Raw exceptions and stack traces must never be shown — replace with user-friendly alerts or toasts

---

## API Contract (Frontend Perspective)

| Endpoint | Source | Purpose |
|---|---|---|
| `POST /homes` | Core → PostgreSQL + Kafka | Register new home + appliances |
| `GET /homes` | Core → Apache Ignite | Poll live home metrics (1–2s interval) |
| `GET /homes/:id/history` | Core → PostgreSQL | Fetch daily consumption history for charts |

**Polling strategy:** All live status reads come from Apache Ignite (sub-millisecond). Historical trend data comes from PostgreSQL.

---

## Business Logic (for UI state)

**Quota thresholds:**
- 80% budget → warning state, alert triggered
- 100% budget → breach state, penalty tariff activated

**Anomaly detection:**
- Appliance exceeding safe power limit for 3 consecutive cycles → marked anomalous
- Counter resets when appliance returns to normal

**Tariff states:** Normal → Penalty (post-100% breach, billing rate increases)

---

## Deliverables

- VoltWise Web App source code (SPA)
- VoltWise Core source code (Spring Boot, modular)
- PostgreSQL DDL scripts (auto-run on Docker setup)
- `docker-compose.yml` for PostgreSQL + Kafka + Ignite
- Swagger/OpenAPI docs for all endpoints
- `README.md` with local setup, env vars, launch commands
