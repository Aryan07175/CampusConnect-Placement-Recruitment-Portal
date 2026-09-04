# CampusConnect — Brand Guidelines

> A placement management portal with a resume-based job matching engine.

---

## 1. Naming

- **Full name:** CampusConnect
- **Tagline:** "Where Talent Meets Opportunity"
- **One-line pitch:** A placement management portal connecting students, recruiters, and placement officers — with a built-in resume-based job matching engine.
- Avoid appending "AI" or "Smart" to the name — the matching engine is rule-based, not ML-based. Keep naming honest to avoid overselling in interviews or demos.

---

## 2. Brand Personality

| Trait | What it means in practice |
|---|---|
| Professional | Clean layouts, no gimmicks, no overly playful copy |
| Trustworthy | Consistent status indicators, clear data, no ambiguous states |
| Efficient | Minimal clicks to complete core actions (apply, post job, shortlist) |
| Approachable | Simple language, no corporate jargon in UI copy |

**Voice:** Clear and direct. Write like a helpful placement cell staff member, not a marketing team.
- ✅ "Your application has been shortlisted."
- ❌ "Great news! You've been handpicked for the next stage of your journey! 🎉"

---

## 3. Color Palette

| Role | Color | Hex | Usage |
|---|---|---|---|
| Primary | Deep Indigo | `#3730A3` | Navbars, primary buttons, headings |
| Primary Light | Indigo Tint | `#6366F1` | Hover states, secondary buttons |
| Accent | Emerald | `#10B981` | Success states, "Selected" status, match-score badges |
| Warning | Amber | `#F59E0B` | Pending/in-review status |
| Danger | Rose | `#E11D48` | Rejected status, errors |
| Neutral Dark | Slate 800 | `#1E293B` | Body text |
| Neutral Light | Slate 100 | `#F1F5F9` | Backgrounds, cards |
| White | Pure White | `#FFFFFF` | Base background |

**Status color mapping (use consistently across all dashboards):**
- Applied → Slate/Neutral
- Under Review → Amber
- Shortlisted → Indigo
- Selected → Emerald
- Rejected → Rose

---

## 4. Typography

| Use | Font | Weight |
|---|---|---|
| Headings | Inter or Poppins | 600–700 |
| Body text | Inter | 400 |
| Numbers/Stats (dashboards) | Inter or IBM Plex Mono | 600 |

- Base font size: 16px
- Headings scale: H1 32px / H2 24px / H3 20px / Body 16px / Caption 14px
- Avoid more than 2 font families in the whole app

---

## 5. Logo Concept (if you design one)

- Simple wordmark is enough — "CampusConnect" in the primary Indigo, medium-bold weight
- Optional icon: two overlapping shapes (e.g., a mortarboard/graduation cap merging into a briefcase, or a simple node-link icon) to represent the "connection" between students and recruiters
- Keep it monochrome-friendly — it should still read clearly in a single color for favicons, README badges, or a printed report cover

---

## 6. UI Component Guidelines

- **Buttons:** Rounded corners (6–8px radius), primary action always in Indigo, destructive actions (reject, delete) always in Rose
- **Cards:** Light shadow, white background on Slate 100 page background, 12px+ padding
- **Match Score Badge:** Circular or pill-shaped, colored by score band:
  - 80–100% → Emerald
  - 50–79% → Amber
  - Below 50% → Slate (neutral, not red — a low match isn't a failure state)
- **Empty states:** Always include a short helpful message (e.g., "No applications yet — browse open jobs to get started") rather than a blank screen

---

## 7. Tone in Copy (examples)

| Context | Copy |
|---|---|
| Empty dashboard | "You haven't applied to any jobs yet. Explore open roles below." |
| Application shortlisted | "Your application for [Role] at [Company] has been shortlisted." |
| Application rejected | "Your application for [Role] at [Company] was not selected this time." |
| Recruiter posts job | "Job posted successfully. It's now visible to eligible students." |
| Admin approves recruiter | "[Company] has been approved and can now post jobs." |

Avoid exclamation marks in status/system messages — reserve them for genuinely celebratory moments (e.g., final selection confirmation) only.

---

## 8. Consistency Checklist

- [ ] Same status colors used across student, recruiter, and admin dashboards
- [ ] Same terminology throughout ("Applications," not sometimes "Submissions")
- [ ] Match score always shown the same way (badge + %) wherever it appears
- [ ] No more than 2 fonts, 1 accent color per state, across the whole app