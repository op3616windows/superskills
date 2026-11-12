## What it does

`observability` designs and implements structured logging, OpenTelemetry tracing, and operational metrics at system boundaries and I/O seams.

The defining constraint is that it confines telemetry to system boundaries and seams rather than scattering unstructured logs through business logic. By keeping domain models clean and instrumenting entrypoints and adapters with correlation IDs and error taxonomies, systems emit machine-readable telemetry that makes production incidents actionable without requiring local reproduction.

## When to reach for it

Type `/observability`, or the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) reaches for it automatically when a task fits.

| Scenario | What to run |
| --- | --- |
| Instrumenting HTTP endpoints, queues, or database adapters | `/observability` |
| Designing deep module seams and interface boundaries | [codebase-design](https://aihero.dev/skills-codebase-design) |
| Responding to a live production incident or outage | [incident](https://aihero.dev/skills-incident) |
| Diagnosing a bug with a reproducible local feedback loop | [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs) |

## Mandatory structured context

Unstructured console strings like `console.log("error saving user")` are useless in modern distributed environments. `observability` mandates structured log records containing:

- **Correlation ID**: Propagated across network hops to trace full user journeys.
- **Tenant and user context**: Essential for isolating multi-tenant bugs.
- **Entity identifiers and action names**: Pinpointing exactly which resource was modified.
- **Latency in milliseconds**: Measuring execution duration for all I/O boundaries.

## Typed error taxonomy

Rather than catching errors generically and rethrowing vague messages, `observability` establishes domain error taxonomies:

- Errors carry machine-readable error codes (such as `INSUFFICIENT_FUNDS` or `GATEWAY_TIMEOUT`).
- Root causes are preserved via error chaining (`{ cause: err }`).
- Client validation errors (4xx) are strictly segregated from internal infrastructure failures (5xx) to avoid alerting on harmless user typos.

## Common questions

**Does adding telemetry to every boundary degrade performance?**
No. Structured logging libraries and OpenTelemetry SDKs are highly optimised, and writing JSON objects to standard output or memory buffers adds negligible overhead compared to network or disk I/O. The cost of missing logs during a production outage is vastly higher.

**Should logging ever be added inside pure domain entities?**
No. Keep domain models pure and deterministic. Telemetry belongs in controllers, HTTP handlers, queue workers, and persistence adapters.

## It's working if

- Logs output structured JSON with correlation IDs and entity identifiers.
- No bare `console.error` calls exist in the diff.
- Errors are categorised with explicit domain codes and chained causes.
- Traces capture boundary spans with durations and exception recordings.

## Where it fits

A model-invoked skill integrated into [codebase-design](https://aihero.dev/skills-codebase-design) and called during [implement](https://aihero.dev/skills-implement) whenever code touches I/O boundaries. Its telemetry provides the foundational evidence used by [incident](https://aihero.dev/skills-incident) during outages. See [ask-matt](https://aihero.dev/skills-ask-matt) for the complete map of skills.
