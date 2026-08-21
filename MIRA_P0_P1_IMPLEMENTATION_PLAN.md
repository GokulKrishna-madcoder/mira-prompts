# Mira Prompts — P0/P1 Production Implementation Plan

## Scope

This plan hardens the existing Mira Prompts architecture for production.

**Existing foundation:** Next.js App Router + Supabase/PostgreSQL + Supabase Auth/Storage/Realtime + Razorpay.

**Critical content rule:** Only administrators can upload, edit, publish, feature, or archive prompts. There is no public creator-upload flow in this phase.

---

# 1. Priority Matrix

| Feature | Priority | Depends On |
|---|---|---|
| Admin-only prompt upload | P0 | Auth + RLS |
| Subscription lifecycle | P0 | Razorpay |
| Razorpay webhook + reconciliation | P0 | Payments |
| Entitlements | P0 | Subscription |
| Admin audit log | P0 | Auth |
| SEO architecture | P0 | Public prompt routes |
| Trending algorithm | P1 | Trusted analytics |
| Admin analytics | P1 | Event pipeline |
| Funnel analytics | P1 | Event pipeline |
| Rate limiting / anti-abuse | P1 | Analytics gateway |
| Observability | P1 | All systems |

---

# 2. Phase 0 — Shared Engineering Foundation

Create common server modules:

```text
src/lib/auth/require-user.ts
src/lib/auth/require-admin.ts
src/lib/auth/require-role.ts

src/lib/payments/razorpay.ts
src/lib/payments/subscriptions.ts
src/lib/payments/entitlements.ts

src/lib/audit/log.ts

src/lib/analytics/events.ts
src/lib/analytics/identity.ts
src/lib/analytics/qualify.ts

src/lib/ratelimit/index.ts

src/lib/seo/metadata.ts
src/lib/seo/schema.ts

src/lib/observability/logger.ts
```

Secrets remain server-only:

```text
SUPABASE_SERVICE_ROLE_KEY
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
```

Never expose them in browser bundles.

---

# 3. P0 — Admin-Only Prompt Upload

## Business Rule

Only:

```text
profiles.role = 'admin'
```

may:

- Upload images.
- Create prompts.
- Edit prompts.
- Publish prompts.
- Feature prompts.
- Archive prompts.
- Delete/archive content.

A normal user must never be able to create a prompt by directly calling a server action, API endpoint, or storage endpoint.

## Authorization Flow

```text
Admin UI
   ↓
Server Action
   ↓
requireAdmin()
   ↓
Validate payload
   ↓
Validate image
   ↓
Upload Storage
   ↓
Insert/update prompt
   ↓
Audit log
   ↓
Revalidate public pages
```

## Required Security Layers

### UI
Hide admin actions from non-admin users.

### Server
Every mutation calls `requireAdmin()`.

### Database
RLS permits writes only to admins.

### Storage
Storage policies permit writes only to admins.

UI hiding alone is never considered security.

## Upload Validation

Validate:

- MIME type.
- Actual file signature.
- Extension.
- File size.
- Image dimensions.
- Filename.
- Image processing result.

Recommended pipeline:

```text
Upload
 ↓
Validate
 ↓
Strip unnecessary metadata
 ↓
Optimize
 ↓
Generate variants
 ↓
Store
```

## Acceptance Criteria

- Non-admin cannot create prompts.
- Non-admin receives 403 from mutation attempts.
- Non-admin cannot upload to prompt storage.
- Admin can create/edit/publish.
- Every admin mutation creates an audit event.

---

# 4. P0 — Subscription Lifecycle

Do not use `profiles.subscription_status` as the authoritative source.

Use:

```text
subscription_plans
subscriptions
subscription_events
payment_transactions
refunds
entitlements
```

## Subscription Model

```text
User
 ↓
Subscription
 ↓
Plan
 ↓
Provider IDs
 ↓
Lifecycle Events
 ↓
Entitlements
```

## subscription_plans

Recommended fields:

```text
id
key
name
billing_interval
amount
currency
razorpay_plan_id
active
metadata
created_at
updated_at
```

Plans should include:

```text
free
prime_monthly
prime_yearly
prime_lifetime
```

Pricing must not be hard-coded into UI components.

## subscriptions

```text
id
user_id
plan_id
provider
provider_customer_id
provider_subscription_id
status
current_period_start
current_period_end
cancel_at_period_end
cancelled_at
ended_at
created_at
updated_at
```

## Lifecycle States

```text
incomplete
trialing
active
past_due
paused
cancelled
expired
completed
```

Lifetime access should be represented as a durable entitlement rather than a fake recurring subscription.

## Lifecycle

```text
FREE
 ↓
Checkout
 ↓
Payment
 ↓
Server verification
 ↓
Webhook confirmation
 ↓
ACTIVE
 ├── Renewal → ACTIVE
 ├── Failure → PAST_DUE
 ├── Cancellation → CANCEL_AT_PERIOD_END
 ├── Period end → EXPIRED
 └── Refund → Entitlement adjustment
```

## Entitlement Service

Never write:

```ts
if (profile.subscription_status === "active")
```

Use:

```ts
canAccess(userId, "premium_prompt")
canAccess(userId, "copy_premium_prompt")
canAccess(userId, "advanced_search")
```

This makes future plans safe to add.

## Acceptance Criteria

- Purchase activates entitlement.
- Renewal keeps entitlement active.
- Payment failure changes state.
- Cancellation is handled.
- Expiry removes premium access.
- Refund handling is deterministic.
- Lifetime entitlement never expires.
- Duplicate provider events cannot duplicate state.

---

# 5. P0 — Razorpay Webhook + Reconciliation

## Core Principle

The browser is not the payment authority.

Frontend verification can provide immediate UX, but the webhook is the authoritative reconciliation path.

## Webhook Flow

```text
Razorpay
 ↓
POST /api/webhooks/razorpay
 ↓
Verify signature
 ↓
Validate event
 ↓
Idempotency check
 ↓
Persist event
 ↓
Process event
 ↓
Update payment/subscription
 ↓
Update entitlement
 ↓
Audit/event log
 ↓
200 OK
```

## payment_webhook_events

```text
id
provider
event_id
event_type
payload_hash
received_at
processed_at
processing_status
attempt_count
error_message
```

Unique constraint:

```text
(provider, event_id)
```

## Idempotency

If the provider sends the same event three times:

```text
Event A
Event A
Event A
```

Mira processes it once.

The repeated requests must not create:

- duplicate transactions,
- duplicate subscriptions,
- duplicate entitlements,
- duplicate analytics,
- duplicate audit records.

## Provider Event Mapping

Maintain a provider-specific adapter.

The application should not scatter Razorpay event names throughout business logic.

Map provider events into internal events such as:

```text
PAYMENT_CAPTURED
PAYMENT_FAILED
SUBSCRIPTION_ACTIVATED
SUBSCRIPTION_RENEWED
SUBSCRIPTION_CANCELLED
SUBSCRIPTION_EXPIRED
REFUND_CREATED
REFUND_PROCESSED
```

Use the exact current Razorpay event names in the adapter according to the configured Razorpay integration.

## Failed Webhook Processing

```text
received
 ↓
processing
 ↓
failed
 ↓
retry
 ↓
processed
```

Persist the failure reason.

Expose failed events to admins.

## Reconciliation Job

Run a scheduled reconciliation process:

```text
Find inconsistent local records
 ↓
Query Razorpay
 ↓
Compare provider state
 ↓
Repair local state
 ↓
Write audit record
```

This protects Mira when webhooks are delayed, lost, or temporarily unavailable.

## Payment Health Metrics

Track:

```text
payment_success_rate
payment_failure_rate
webhook_failure_rate
unprocessed_webhooks
subscription_state_mismatch
```

---

# 6. P0 — Admin Audit Log

Create:

```text
admin_audit_logs
```

Fields:

```text
id
actor_user_id
action
resource_type
resource_id
before_data
after_data
metadata
ip_hash
user_agent
created_at
```

Avoid storing unnecessary sensitive information.

## Actions

```text
PROMPT_CREATED
PROMPT_UPDATED
PROMPT_PUBLISHED
PROMPT_ARCHIVED
PROMPT_FEATURED
PROMPT_DELETED

CATEGORY_CREATED
CATEGORY_UPDATED
CATEGORY_DELETED

SUBSCRIPTION_ADJUSTED
REFUND_PROCESSED

USER_ROLE_CHANGED
USER_SUSPENDED
SETTINGS_CHANGED
```

## Audit Flow

```text
Admin Action
 ↓
Authorization
 ↓
Mutation
 ↓
Audit Event
```

Where possible, the mutation and audit insertion should be transactionally coupled.

## Admin UI

```text
Audit Logs

Date | Admin | Action | Resource | Result
```

Opening a record should show before/after changes.

Audit records must not be editable through normal admin UI.

---

# 7. P0 — SEO Architecture

Mira should treat SEO as an acquisition engine.

## Indexable Routes

```text
/
/explore
/prompts/[slug]
/categories/[slug]
/tags/[slug]
```

Do not index:

```text
/admin/*
/settings
/saved
/login
/signup
/api/*
```

unless intentionally required.

## Prompt SEO

Every published prompt should generate:

```text
title
description
canonical
Open Graph
Twitter/X metadata
JSON-LD
```

Example:

```text
Cinematic Rain Portrait Prompt | Mira Prompts
```

## Metadata Module

Create:

```text
src/lib/seo/metadata.ts
```

The module receives prompt/category/site data and produces route metadata consistently.

## Structured Data

Use only schema types that accurately represent the page:

```text
WebSite
WebPage
ImageObject
BreadcrumbList
```

Do not create misleading Product or Review structured data.

## Sitemap

Generate:

```text
/sitemap.xml
```

Include:

- Published prompts.
- Public categories.
- Public tags.
- Important static pages.

Exclude:

- Drafts.
- Archived content.
- Private pages.
- Admin pages.

## Canonical URL

Every prompt must have one canonical URL.

Create:

```text
prompt_slug_history
```

When a slug changes:

```text
old URL
 ↓
301
 ↓
new canonical URL
```

## OG Images

Generate controlled social previews.

Recommended:

```text
1200 × 630
```

Do not put premium prompt text into publicly accessible OG assets.

## SEO Acceptance Criteria

- Unique metadata per published prompt.
- Canonical URLs.
- Working sitemap.
- Correct robots rules.
- Valid OG previews.
- Valid structured data.
- Stable redirects after slug changes.
- Drafts excluded from indexable content.

---

# 8. P1 — Trusted Analytics Event Pipeline

Trending and funnel analytics must never read arbitrary browser counters.

## Event Flow

```text
Browser
 ↓
Analytics endpoint
 ↓
Schema validation
 ↓
Rate limiting
 ↓
Identity validation
 ↓
Deduplication
 ↓
Abuse scoring
 ↓
Qualified event
 ↓
Event store
 ↓
Aggregation
```

## Event Contract

```text
event_id
event_name
anonymous_id
user_id
session_id
prompt_id
page
timestamp
properties
```

Use a controlled event taxonomy.

Core events:

```text
page_view
prompt_impression
prompt_view
prompt_copy
prompt_save
prompt_share

search_performed
search_result_click

signup_started
signup_completed

pricing_view
checkout_started
payment_completed
subscription_activated
subscription_cancelled
```

---

# 9. P1 — Rate Limiting + Anti-Analytics Abuse

## Critical Rule

Never implement:

```text
GET /prompts/foo
→ increment view_count
```

A bot can then inflate a prompt to the top of Trending.

Instead:

```text
Request
 ↓
Identity/session validation
 ↓
Rate limit
 ↓
Deduplication
 ↓
Bot/anomaly checks
 ↓
Qualified event
 ↓
Analytics
```

## Rate Limit Starting Values

These are starting points and must be tuned using telemetry:

```text
Analytics events: 60/minute/identity
Search:           60/minute/identity
Copy:             20/minute/identity
Save:             30/minute/identity
Admin upload:     10/minute/admin
```

Use server-side rate limiting. Browser throttling is never sufficient.

## Event Deduplication

Create a fingerprint from:

```text
event_type
prompt_id
anonymous_id
time_bucket
```

Store a unique constraint around the deduplication key.

## Qualified Views

A view should not simply mean "HTTP request happened."

Use:

```text
valid session
+
valid event
+
not recently counted for same prompt/session
+
not suspicious
```

The exact qualification window should be configurable.

## Abuse Signals

Consider:

```text
request frequency
identical repeated requests
IP concentration
session behavior
abnormal navigation
automation-like timing
```

Do not permanently blacklist based on one signal.

## IP Privacy

If IP-based controls are needed, prefer short-lived keyed/hashed identifiers rather than retaining raw IP addresses indefinitely.

## Analytics Firewall

Create one ingestion service:

```text
analytics_ingestion_service
```

No frontend feature should write directly into trusted analytics tables.

---

# 10. P1 — Trending Algorithm

## Goal

Trending measures recent engagement velocity rather than lifetime popularity.

## Inputs

Trusted events:

```text
qualified_views
copies
saves
shares
```

Exclude:

```text
drafts
archived prompts
deleted prompts
admin/test traffic
duplicate events
rejected events
suspicious traffic
```

## Scoring

Conceptually:

```text
base_score =
    view_weight * qualified_views
  + copy_weight * copies
  + save_weight * saves
  + share_weight * shares

final_score =
    base_score * recency_decay
```

Use a configurable exponential or similar decay function.

Do not hard-code final weights forever.

## Windows

Provide:

```text
Trending Today
Trending This Week
Trending This Month
```

## Precomputation

Do not calculate complex trending rankings on every user request.

Run an aggregation job every 15–60 minutes:

```text
Trusted Events
 ↓
Aggregate
 ↓
Calculate Scores
 ↓
Store Snapshot
```

Create:

```text
prompt_trending_scores
```

## Editorial Controls

Admin can:

```text
Feature
Pin
Exclude from Trending
```

Editorial controls must be separate from the algorithm.

---

# 11. P1 — Admin Analytics

## Dashboard

### Product

```text
Total Users
Active Users
Published Prompts
Views
Copies
Saves
Paid Users
MRR
```

### Content

```text
Prompts Published
Top Prompts
Top Categories
Top Models
Top Tags
```

### Engagement

```text
Copy Rate
Save Rate
Share Rate
Prompt Detail CTR
```

### Search

```text
Searches
Top Queries
Zero-result Queries
```

### Revenue

```text
MRR
ARR
New Subscriptions
Cancellations
Churn
Refunds
```

## Aggregation

Do not run large raw-event queries on every dashboard request.

Create:

```text
daily_platform_metrics
daily_prompt_metrics
daily_category_metrics
daily_subscription_metrics
```

Precompute where practical.

## Time Ranges

```text
Today
7 Days
30 Days
90 Days
12 Months
Custom
```

---

# 12. P1 — Funnel Analytics

## Core Funnel

```text
Visitor
 ↓
Gallery View
 ↓
Prompt Detail
 ↓
Copy
 ↓
Signup
 ↓
Premium Prompt View
 ↓
Pricing View
 ↓
Checkout Started
 ↓
Payment Completed
 ↓
Active Subscription
```

## Key Conversion Rates

```text
Prompt View → Copy
Copy → Signup
Signup → Paid
Pricing → Checkout
Checkout → Payment
```

## Attribution

Capture:

```text
utm_source
utm_medium
utm_campaign
utm_content
referrer
landing_page
```

Only retain information needed for product analytics.

## Funnel Requirements

Admin should be able to choose:

```text
Date range
Source
Landing page
Prompt/category
Device class
New vs returning user
```

Do not expose unnecessary personal data.

---

# 13. P1 — Observability

Observability must answer:

```text
What happened?
Why?
Is the system healthy now?
```

## Structured Logging

Use structured events rather than uncontrolled console strings.

Example:

```json
{
  "event": "payment_verification_failed",
  "request_id": "...",
  "provider": "razorpay",
  "severity": "error"
}
```

Never log:

```text
passwords
access tokens
payment secrets
webhook secrets
unnecessary sensitive data
```

## Request Correlation

Every request receives:

```text
request_id
```

Propagate it through:

```text
Browser
 ↓
Next.js
 ↓
Server Action
 ↓
Supabase
 ↓
External provider
```

Async jobs receive a job ID.

## Error Tracking

Track:

```text
server exceptions
client exceptions
server action failures
database failures
storage failures
auth failures
payment failures
webhook failures
analytics ingestion failures
```

## Performance

Monitor:

```text
LCP
CLS
INP
TTFB
API latency
database latency
storage latency
```

## Business Health

Monitor:

```text
payment_success_rate
payment_failure_rate
webhook_failure_rate
subscription_state_mismatch
upload_failure_rate
analytics_event_rejection_rate
duplicate_event_rate
```

## Alerts

Alert on meaningful sustained failures:

```text
5xx spike
payment failure spike
webhook failure spike
database failure spike
upload failure spike
analytics pipeline failure
storage failure
```

Avoid creating an alert for every individual exception.

## Health Endpoints

Create:

```text
/api/health
/api/ready
```

Separate:

```text
application alive
dependencies ready
```

Do not expose sensitive dependency diagnostics publicly.

## Admin System Health

Create:

```text
/admin/system-health
```

Show:

```text
Application       Healthy
Database          Healthy
Storage            Healthy
Auth               Healthy
Payments           Healthy
Webhooks           Healthy
Analytics          Healthy
```

---

# 14. Database Additions

Recommended production additions:

```text
subscription_plans
subscriptions
subscription_events
payment_transactions
refunds
entitlements

payment_webhook_events

admin_audit_logs

prompt_slug_history

analytics_events
analytics_event_dedup

daily_platform_metrics
daily_prompt_metrics
daily_category_metrics
daily_subscription_metrics

prompt_trending_scores

feature_flags
notification_preferences
```

---

# 15. Implementation Sequence

## Sprint 1 — Security + Commerce

- [ ] Admin-only prompt mutations.
- [ ] Prompt RLS.
- [ ] Storage RLS.
- [ ] Subscription tables.
- [ ] Entitlement service.
- [ ] Razorpay adapter.
- [ ] Webhook endpoint.
- [ ] Webhook signature verification.
- [ ] Webhook idempotency.
- [ ] Payment transaction storage.

## Sprint 2 — Payment Reliability + Audit

- [ ] Subscription state machine.
- [ ] Renewal.
- [ ] Cancellation.
- [ ] Expiry.
- [ ] Refund handling.
- [ ] Reconciliation job.
- [ ] Admin audit log.
- [ ] Audit UI.
- [ ] Payment health metrics.

## Sprint 3 — SEO

- [ ] Dynamic metadata.
- [ ] Canonicals.
- [ ] Sitemap.
- [ ] Robots.
- [ ] JSON-LD.
- [ ] OG images.
- [ ] Slug history.
- [ ] Redirect handling.

## Sprint 4 — Analytics Security

- [ ] Event taxonomy.
- [ ] Event schema.
- [ ] Anonymous/session identity.
- [ ] Analytics gateway.
- [ ] Server-side rate limiting.
- [ ] Deduplication.
- [ ] Abuse scoring.
- [ ] Aggregation jobs.

## Sprint 5 — P1 Intelligence

- [ ] Trending scoring.
- [ ] Trending snapshots.
- [ ] Admin analytics.
- [ ] Funnel analytics.
- [ ] Search analytics.
- [ ] Content analytics.
- [ ] Revenue analytics.

## Sprint 6 — Observability

- [ ] Structured logging.
- [ ] Request IDs.
- [ ] Error monitoring.
- [ ] Performance monitoring.
- [ ] Payment alerts.
- [ ] Webhook alerts.
- [ ] Database alerts.
- [ ] Analytics alerts.
- [ ] System health page.

---

# 16. Definition of Done

## Security

- [ ] Only admins can upload.
- [ ] Only admins can publish.
- [ ] Storage writes are admin-protected.
- [ ] RLS is tested.
- [ ] Premium content cannot leak through public payloads.
- [ ] Behavioral endpoints are rate-limited.

## Payments

- [ ] Subscription state is server-controlled.
- [ ] Webhooks are verified.
- [ ] Webhooks are idempotent.
- [ ] Renewals work.
- [ ] Failed payments are handled.
- [ ] Cancellation works.
- [ ] Refunds are handled.
- [ ] Entitlements are correct.
- [ ] Reconciliation exists.

## Content

- [ ] Admin can upload/edit/publish/archive.
- [ ] Every privileged mutation is audited.

## SEO

- [ ] Published prompts have unique metadata.
- [ ] Canonicals work.
- [ ] Sitemap works.
- [ ] Robots works.
- [ ] OG previews work.
- [ ] Structured data validates.
- [ ] Slug changes preserve SEO equity.

## Analytics

- [ ] Events use a strict schema.
- [ ] Duplicate events are rejected.
- [ ] Bot/suspicious events are filtered.
- [ ] Rate limits work.
- [ ] Trending uses qualified engagement.
- [ ] Admin dashboard uses aggregated data.
- [ ] Funnels are measurable.

## Observability

- [ ] Errors are captured.
- [ ] Requests have correlation IDs.
- [ ] Payment failures are visible.
- [ ] Webhook failures are visible.
- [ ] Database failures are visible.
- [ ] Analytics failures are visible.
- [ ] Critical alerts exist.
- [ ] System health is inspectable.

---

# 17. Architectural Rules

1. **Never trust the client for authorization.**
2. **Never trust browser payment success as the final payment state.**
3. **Never increment analytics directly from arbitrary page requests.**
4. **Never allow analytics events to bypass rate limiting and deduplication.**
5. **Never expose premium prompt text unintentionally through HTML, JSON, metadata, or public APIs.**
6. **Never hard-code subscription prices or entitlements into UI components.**
7. **Never mutate subscription state without a provider event or explicitly audited admin action.**
8. **Every admin mutation must be auditable.**
9. **Every public prompt has one canonical URL.**
10. **Keep the application monolithic until actual scale requires service separation.**

---

# 18. Final Architecture Position

Do not introduce microservices yet.

Recommended:

```text
One Next.js Application
        +
One Supabase Project
        +
Razorpay
        +
Analytics/Event Layer
        +
Observability Layer
```

Keep domains separated in code:

```text
/auth
/content
/commerce
/entitlements
/analytics
/seo
/admin
/observability
```

The engineering principle is:

> **Keep the product simple for users, strict around money and security, trustworthy around analytics, and scalable around discovery.**
