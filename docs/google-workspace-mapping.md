# Google Workspace → Headword CRM Mapping (SYS-63)

**Purpose:** Define how Google Workspace data (Contacts, Calendar, Gmail metadata, Identity) maps into the CRM database based on the ERD.

---

## Scope
- Google Identity → app_user
- Google Contacts → client
- Google Calendar → interaction
- Gmail metadata → interaction
- Data ownership rules

---

### Google Identity -> app_user
- sub
- email
- given_name
- family_name
- name
- picture

### CRM Output
**Table:** app_user

| Google field | CRM field | Type | Notes |
|------------|-----------|------|------|
| `sub` | `google_id` | text | Unique Google ID |
| `email` | `email` | text | Must end with `@futureandsuns.com` |
| `given_name` | `first_name` | text |  |
| `family_name` | `last_name` | text |  |
| `name` | `display_name` | text | fallback |
| `picture` | `profile_picture` | text/url | optional |
| (now) | `created_at` | timestamp | set by DB |
| (now) | `updated_at` | timestamp | set by DB |

### Rules
- Only allow login if email domain matches: `@futureandsuns.com`
- If `google_id` exists → update record
- Else → create new `app_user`

---

## Google Contacts → CRM Client

### (People API)
Common fields:
- `resourceName` (contact id)
- `names[]` (givenName, familyName, displayName)
- `emailAddresses[]`
- `phoneNumbers[]`
- `organizations[]` (company, title)
- `addresses[]`
- `urls[]`
- `biographies[]` / notes
- `photos[]`

### CRM Output
**Table:** `client`

| Google field | CRM field | Type | Notes |
|------------|-----------|------|------|
| `resourceName` | `google_contact_id` | text | Store for re-sync |
| `names[0].givenName` | `first_name` | text | required in CRM; fallback to split displayName |
| `names[0].familyName` | `last_name` | text | required in CRM |
| `emailAddresses[0].value` | `email` | text | used for dedupe |
| `phoneNumbers[0].value` | `phone_number` | text | normalize later |
| `organizations[0].name` | `business_name` | text | company |
| `organizations[0].title` | `title` | text | optional |
| `addresses[0]` | `address` | jsonb | map into your JSON shape |
| `urls[]` | `website` or `additional_info` | text/json | depends on schema |
| `biographies[0].value` | `additional_info` | text | or notes field |
| (computed) | `tags` | text[] | e.g. `["google-contact"]` |
| (now) | `created_at` | timestamp | set by DB |
| (now) | `updated_at` | timestamp | set by DB |

### Dedupe / Matching Rules
- Primary key for matching: **email**
- Secondary match: phone number (optional)
- If existing client has same email → update fields that are empty (or based on ownership rules)

---

## Google Calendar Events → CRM Interaction

### Google Inputs (Calendar API)
- `id` (event id)
- `summary`
- `description`
- `location`
- `start.dateTime` / `end.dateTime`
- `attendees[]` (email, responseStatus)
- `organizer.email`
- `hangoutLink`
- `updated`
- `status` (confirmed/cancelled)

### CRM Output
**Table:** `interaction`

| Google field | CRM field | Type | Notes |
|------------|-----------|------|------|
| `id` | `google_event_id` | text | store to re-sync |
| `summary` | `title` | text | |
| `description` | `body` | text | optional |
| `start.dateTime` | `occurred_at` | timestamp | or `starts_at` |
| `end.dateTime` | `ends_at` | timestamp | optional |
| `organizer.email` | `owner_email` or `app_user_id` | fk/text | tie to app_user |
| `attendees[].email` | `participants` | jsonb | optional |
| `status` | `status` | text | cancelled events mark interaction cancelled |
| (constant) | `type` | text | `"MEETING"` |
| (computed) | `client_id` | uuid fk | link by attendee email matching a client |

### Linking event → client_id (important)
Strategy:
1. Look at attendees list
2. For each attendee email:
   - if matches a CRM client email → set `client_id`
3. If multiple clients match, either:
   - create multiple interactions OR
   - store many-to-many (future work)

---

## Gmail Metadata -> CRM Interaction

### Google Inputs (Gmail API)
We store **metadata only**, such as:
- `id`
- `threadId`
- headers:
  - `From`
  - `To`
  - `Cc`
  - `Subject`
  - `Date`
- labelIds (optional)
- snippet (optional)

### CRM Output
**Table:** `interaction`

| Gmail field | CRM field | Type | Notes |
|------------|-----------|------|------|
| `id` | `google_message_id` | text | store for re-sync |
| `threadId` | `google_thread_id` | text | optional |
| `Subject` | `title` | text | |
| `snippet` | `body` | text | optional |
| `Date` | `occurred_at` | timestamp | parse |
| `From` | `from_email` | text | used for client link |
| `To/Cc` | `to_emails` | jsonb | optional |
| (constant) | `type` | text | `"EMAIL"` |
| (computed) | `client_id` | uuid fk | match from/to against client emails |

---

## Data Ownership

### Recommended rule set (simple MVP)
- CRM is source of truth for:
  - tags
  - relationship notes
  - relationship status
- Google is source of truth for:
  - contact name/email/phone (unless CRM overrides)
  - calendar time/summary for synced events

### Sync direction (MVP)
- Google → CRM (one-way) initially
- CRM → Google later (optional, requires conflict rules)

---

## Security Notes

- Use OAuth 2.0 with `openid email profile` + needed scopes
- Store refresh token securely (env + secret storage in deployment)
- Do not log access tokens
- Only accept domain: `@futureandsuns.com` if required