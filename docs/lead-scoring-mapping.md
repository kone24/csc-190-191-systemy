# SYS-106: Data Mapping (Lead Scoring)

**Purpose:** Define how our CRM data is mapped into a standardized input format for the Lead Scoring Engine.

---

## Goals
- Identify which fields influence lead quality
- Define how those fields are retrieved/transformed
- Provide a consistent input structure for scoring
- Define where scoring results are stored 

---

## Scope
- Client data
- Interaction data
- reminder/activity data
- derived fields used for scoring
- output fields stored in `ai_recommendation`

---

## Lead Definition

A "lead" is defined by a record in the `clients` table

Each lead is evaluated by:
- client attributes
- interaction history
- reminder activity

---

## Scoring Input Structure

All data must be transformed into the following structure (tentative) for scoring:

```ts
type LeadScoringInput = {
    clientId: string;
    budgetRange: string | null;
    projectTimeline: string | null;
    servicesNeeded: string[] | null;
    preferredContactMethod: string | null;
    relationshipStatus: string | null;

    interactionCount: number;
    meetingCount: number;
    emailCount: number;
    lastInteractionAt: string | null;

    reminderCount: number;
    hasUpcomingReminder: boolean;
};
```
---

## Data Mapping

### Clients -> Lead Input

table: `clients`

| Database Field | Scoring Field | Notes |
|----------------|---------------|-------|
| `id` | `clientId` | Primary identifier |
| `budget_range` | `budgetRange` | Indicates financial potential |
| `project_timeline` | `projectTimeline` | Indicates urgency |
| `services_needed` | `servicesNeeded` | Convert JSON -> array |
| `preferred_contact_method` | `preferredContactMethod` | Optional |
| `relationship_status` | `relationshipStatus` | CRM stage |

---

### Interaction -> Lead Input

table: `interaction`

| Database Field | Usage | Notes |
|----------------|------|-------|
| `client_id` | grouping key | Links interaction to client |
| `type` | counting | meeting / email / call / chat |
| `started_at` | time tracking | Used for last interaction |
| `interaction_id` | counting | total interaction count |

#### Derived Values
(computed from interaction data, not directly stored)

| Field | Logic |
|------|------|
| `interactionCount` | total interactions for client |
| `meetingCount` | count where type = 'meeting' |
| `emailCount` | count where type = 'email' |
| `lastInteractionAt` | latest `started_at` |

---

### Reminders -> Lead Input

table: `reminders`

| Database Field | Usage | Notes |
|----------------|------|-------|
| `client_id` | grouping key | Links reminder to client |
| `id` | counting | total reminders |
| `remind_at` | time check | used for upcoming reminders |
| `status` | filter | ignore completed/cancelled if needed |

#### Derived Values

| Field | Logic |
|------|------|
| `reminderCount` | total reminders for client |
| `hasUpcomingReminder` | true if reminder exists where `remind_at > now()` and active |

---

## Normalization Rules

### Missing Data
- Missing values -> `null`
- Counts -> default to `0`

### budgetRange
Used later for scoring weights:
- High -> strong signal
- Medium -> moderate
- Low -> weak

### projectTimeline
Used for urgency:
- Immediate -> strong signal
- Short-term -> moderate
- Long-term -> weak

### servicesNeeded
- Convert JSON/array -> string array
- If empty -> null

### interactionCount / meetingCount / emailCount
- Always numeric
- Default = `0`

### lastInteractionAt
- Most recent timestamp
- If none -> null

### reminderCount
- Default = `0`

### hasUpcomingReminder
- Default = `false`

---

## Output Mapping (Lead score storage)

Lead scoring engine results will be stored in `ai_recommendation`.

| Output | Database Field | Notes |
|--------|----------------|-------|
| `clientId` | `id` | references client |
| `null` | `project_id` | optional |
| `"lead_score"` | `type` | identifies scoring record |
| score (0–100) | `score` | numeric score |
| label | `recommendation` | "High potential", etc. |
| reasoning | `details` | JSON explanation |
| timestamp | `created_at` | scoring time |

## Data Ownership

- CRM tables (`clients`, `interaction`, `reminders`) are source data
- Lead score is derived data
- Scoring does not overwrite CRM fields
- Scores are stored separately in `ai_recommendation`