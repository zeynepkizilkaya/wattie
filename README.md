# Wattie

Real-time IoT energy monitoring platform. Tracks home power consumption,
applies tariff/penalty rules, detects anomalies, and sends AI-generated
recommendations.

## Architecture

- **wattie-core** — Spring Boot application: home/appliance registration,
  live status & historical trend endpoints, telemetry processing (Kafka →
  Ignite), tariff/anomaly rules, AI notifications.
- **wattie-sensors** — Standalone Spring Boot service that simulates
  physical appliances, generating realistic power readings and publishing
  them to Kafka. Fully decoupled from Core (no direct database access);
  learns about registered homes/appliances via the Kafka registration topic.
- **PostgreSQL** — persistent storage (homes, appliances, event logs,
  consumption snapshots).
- **Apache Kafka** — event backbone (registration + telemetry topics).
- **Apache Ignite** — in-memory live state (per-home running totals,
  penalty status) for low-latency status queries.

## Prerequisites

- Java 21
- Maven
- Docker Desktop (running)
- IntelliJ IDEA (recommended)

## Setup

### 1. Start infrastructure

From the `wattie-core` folder (docker-compose.yml lives here):

```bash
cd wattie-core
docker-compose up -d
```

This starts PostgreSQL (5432), Kafka (9092), and Ignite (10800). Verify
with `docker ps` — you should see `wattie-postgres`, `wattie-kafka`, and
`wattie-ignite` all running.

### 2. Run wattie-core

Open the `wattie-core` folder as a project in IntelliJ.

**Important:** due to a known Java module conflict with Ignite's legacy
JDBC driver, you must add the following VM options to the run
configuration (Run → Edit Configurations → Modify options → Add VM
options), or the app will fail to start with a `NoClassDefFoundError`:

```
--add-opens=java.base/java.io=ALL-UNNAMED --add-opens=java.base/java.nio=ALL-UNNAMED --add-opens=java.base/java.net=ALL-UNNAMED --add-opens=java.base/java.util=ALL-UNNAMED --add-opens=java.base/java.util.concurrent=ALL-UNNAMED --add-opens=java.base/java.util.concurrent.locks=ALL-UNNAMED --add-opens=java.base/java.util.concurrent.atomic=ALL-UNNAMED --add-opens=java.base/java.lang=ALL-UNNAMED --add-opens=java.base/java.lang.invoke=ALL-UNNAMED --add-opens=java.base/java.math=ALL-UNNAMED --add-opens=java.sql/java.sql=ALL-UNNAMED --add-opens=java.base/jdk.internal.misc=ALL-UNNAMED --add-opens=java.base/sun.nio.ch=ALL-UNNAMED --add-opens=java.base/sun.util.calendar=ALL-UNNAMED --add-opens=java.base/sun.reflect.generics.reflectiveObjects=ALL-UNNAMED --add-opens=java.management/com.sun.jmx.mbeanserver=ALL-UNNAMED --add-opens=jdk.management/com.sun.management.internal=ALL-UNNAMED --add-opens=jdk.internal.jvmstat/sun.jvmstat.monitor=ALL-UNNAMED --add-exports=java.base/jdk.internal.misc=ALL-UNNAMED --add-exports=java.base/sun.nio.ch=ALL-UNNAMED --add-exports=java.management/com.sun.jmx.mbeanserver=ALL-UNNAMED --add-exports=jdk.internal.jvmstat/sun.jvmstat.monitor=ALL-UNNAMED --add-exports=java.base/sun.reflect.generics.reflectiveObjects=ALL-UNNAMED
```

Run the application. It starts on `http://localhost:8080`. Swagger UI is
available at `http://localhost:8080/swagger-ui/index.html`.

### 3. Run wattie-sensors

Open the `wattie-sensors` folder as a **separate** project in IntelliJ (no
special VM options needed here). Run it — it will connect to the same
Kafka instance and start generating telemetry for any homes registered in
Core.

### 4. Try it out

1. In Swagger, `POST /api/homes` to register a home with at least one
   appliance.
2. Wait ~10-15 seconds for wattie-sensors to start publishing readings.
3. `GET /api/homes/{id}/status` — should show growing `totalKwh` and
   `totalCost` values.
4. `GET /api/homes/{id}/trend` — populated once the snapshot scheduler
   runs (every 60 seconds, for demo purposes).

## Configuration

All connection settings (Postgres, Kafka, Ignite) are in
`wattie-core/src/main/resources/application.properties` and
`wattie-sensors/src/main/resources/application.properties`, defaulting to
localhost. No secrets are hardcoded elsewhere.

## Notes for teammates

- Sample interval assumption: telemetry is generated/expected every **2
  seconds** (`TelemetryConstants` / `SensorConstants` in each project —
  keep these in sync if you change one).
- Kafka topics: `wattie.home.registration`, `wattie.telemetry.data`
  (defined in `KafkaTopicConfig` / `KafkaTopics` in each project).
