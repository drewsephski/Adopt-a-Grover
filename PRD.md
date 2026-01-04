# Product: Adopt a Grover

## Version: v1 (Christmas MVP)

## Scope: Small-scale nonprofit seasonal donation system

### Purpose

Adopt a Grover is a **seasonal donation coordination web application** for a local nonprofit serving families in Fox River Grove (“Grovers”). The system enables families (represented anonymously) to publish specific gift needs and allows donors to claim those gifts for physical drop-off.

The product replaces ad-hoc tools like SignUpGenius with a **purpose-built donation marketplace** optimized for clarity, trust, and low administrative overhead.

### Primary Use Case

Coordinate Christmas gift donations for:

* ~30 families
* Up to ~40 donors
* One physical drop-off location

### Core Principle

**Nothing should feel fragile.**
Admins must be able to undo mistakes, donors must never feel confused, and families must never feel exposed.

## Goals & Success Criteria

### Organizational Goals

* Reduce admin time spent managing donations
* Prevent duplicate or missed gift claims
* Provide clear, auditable visibility into donation status

### Donor Goals

* Quickly understand how to help
* Easily claim one or more gifts
* Know exactly what to do after claiming

### Success Metrics

* ≥90% of listed gifts claimed before campaign close
* Zero duplicate claims per gift
* Near-zero donor clarification emails
* Admin reports system is easier than SignUpGenius

## Target Users

### Admin (Nonprofit Organizer)

* Non-technical
* Needs full control and reversibility
* Manages families, gifts, and claims

### Donor (Public)

* Any site visitor
* No account creation
* Email-only identification
* First-time and one-time users

## Functional Requirements

### Campaign Lifecycle

### Campaign States

* **Draft** (admin-only setup)
* **Active** (public donation open)
* **Closed** (read-only, donation disabled)
* **Archived** (historical reference)

Christmas campaign is the default v1 focus, but system must support future campaigns.

### Family Management (Admin)

* Create family using:

  * Alias name only (e.g., “Family A”, “Grover Family 12”)
* Edit family at any time
* Delete family:

  * Removes all associated gifts
  * Releases any claims
* Families are **never visible with personal details**

### Gift Management (Admin)

Each gift includes:

* Gift name
* Optional description
* Optional Amazon or product link
* Quantity required

Admin capabilities:

* Add gifts to a family
* Edit gift details at any time
* Increase or decrease quantity *after* claims
* Delete gifts (automatically unclaims if needed)

Gift status is computed dynamically:

* Available
* Partially claimed
* Fully claimed

### Donor Flow (Critical Path)

#### Browse

* Donor lands on public page
* Sees list of families with:

  * Alias name
  * Progress indicator (e.g., “3 of 7 gifts claimed”)

### Select

* Donor can:

  * Claim a single gift
  * Claim multiple gifts
  * Adopt an entire family (claim all remaining gifts)

### Claim

* Minimal form:

  * Name
  * Email
* No account creation
* Real-time availability check before confirmation

### Confirmation

After claiming, donor sees:

* Clear list of claimed gifts
* Physical drop-off address:
  **624 Ellington Ct**
* Instructions for delivery
* Confirmation email sent immediately

### Donor Communication

#### Email (Required)

* Sent upon claim
* Includes:

  * Claimed gift(s)
  * Drop-off address
  * Any deadline messaging
  * Friendly, human tone

No donor login, dashboard, or ongoing email campaigns required for v1.

### Admin Dashboard

#### Core Views

* Unclaimed gifts
* Recently claimed gifts
* Families with incomplete coverage

### Admin Actions

* Remove a donor claim (reopens gift)
* Edit gift quantities
* Close campaign

### Design Rule

Admin dashboard should feel **calm, not analytical**.
No charts unless directly useful.

## Non-Functional Requirements

### Scalability

* Designed intentionally for small scale
* No optimization for thousands of users required

### Reliability

* All actions reversible
* No destructive action without confirmation

### Security & Privacy

* Alias-only family representation
* Donor email stored only for confirmation and admin reference
* No PII exposure on public pages

## UX & Design Requirements

### Tone

* Warm
* Community-oriented
* Trustworthy
* Non-commercial

### Visual Hierarchy

* Families first
* Gifts second
* Admin controls hidden from donors

### UX Constraints

* No long scrolling lists without structure
* Clear visual states for gift availability
* No ambiguity about “what happens next”

## Out of Scope (v1)

* Donor accounts or profiles
* Online payments
* Shipping integrations
* Automated reminders
* Multi-location drop-off
* Analytics dashboards

## Future Considerations (Post-Christmas)

* Other seasonal campaigns (Back-to-school, Thanksgiving)
* Admin templates for repeat campaigns
* Optional donor follow-up reminders
* Exportable reports

## Technical Notes (Non-Prescriptive)

* Web-based
* Admin-authenticated dashboard
* Public read/claim-only frontend
* Email service required
* Simple relational data model:

  * Campaign → Families → Gifts → Claims

## Product Philosophy (Non-Negotiable)

* This is **not** a generic signup tool.
* This is **not** a donor CRM.
* This is **coordination software**, optimized for empathy, clarity, and reversibility.
