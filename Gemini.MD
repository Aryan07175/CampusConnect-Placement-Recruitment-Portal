# CampusConnect — Implementation Plan

> Placement Management & Recruitment Portal with Resume-Based Job Matching

This document is the working implementation plan for building CampusConnect during placement season. It's scoped to be realistic for a solo/small-team build with limited time before interviews.

---

## 1. Objective

Build a focused, well-engineered 3-role platform (Student / Recruiter / Admin) that demonstrates:
- Clean backend architecture (Java + Spring Boot)
- Secure authentication & role-based authorization (JWT)
- Relational database design (MySQL)
- REST API design
- A working skill-matching recommendation feature
- A React frontend consuming the APIs

**Guiding principle:** 5–7 features built well > 20 features built shallow.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Backend | Java 17/21, Spring Boot, Spring Security, Spring Data JPA |
| Database | MySQL |
| Frontend | React.js, React Router, Axios, Tailwind CSS |
| Charts | Recharts (admin analytics only) |
| Auth | JWT + Role-Based Access Control |
| Docs (stretch) | Swagger / OpenAPI |
| Deployment (stretch) | Docker, AWS, CI/CD |

---

## 3. Build Phases

### Phase 0 — Setup (Days 1–2)
- Initialize Spring Boot project (Web, Security, JPA, MySQL driver)
- Initialize React project with Tailwind + Axios + React Router
- Set up MySQL schema and connection
- Set up Git repo with sensible branching (`main`, `dev`, feature branches)

### Phase 1 — Core Auth & Data Layer (Days 3–6)
- `User`, `Student`, `Recruiter`, `Company` entities
- Registration/login (`/api/auth/register`, `/api/auth/login`)
- Password hashing (BCrypt)
- JWT issuing + `JwtAuthenticationFilter`
- Role-based `SecurityConfig` (`ROLE_STUDENT`, `ROLE_RECRUITER`, `ROLE_ADMIN`)
- Global exception handler (`GlobalExceptionHandler`)

**Milestone check:** Can register as each role, log in, get a JWT, and hit a role-protected endpoint that correctly returns 403 for the wrong role.

### Phase 2 — Student & Job Flow (Days 7–12)
- Student profile CRUD (education, skills, projects, internships)
- Resume upload (store file, save `resume_url`)
- Job entity + Recruiter job creation (`POST /api/jobs`)
- Job listing with search/filter/pagination (`GET /api/jobs`)
- Application flow (`POST /api/applications`, status tracking)
- Student dashboard (React): profile completion %, applications, upcoming drives

**Milestone check:** A recruiter can post a job; a student can browse, filter, and apply; application status is visible on both sides.

### Phase 3 — Recruiter & Interview Flow (Days 13–16)
- Recruiter view of applicants per job, with filter/shortlist/reject actions
- `Interview` entity — scheduling, round, status
- Status update propagation to student dashboard
- Recruiter dashboard (React)

### Phase 4 — Standout Feature: Skill Matching (Days 17–20)
- `RecommendationService`: compare student skill set vs job's required skills
- Weighted scoring (e.g., required skills weighted higher than nice-to-haves; optionally factor in CGPA eligibility)
- `GET /api/recommendations/student/{id}`
- "X% Match" UI on student job listings

**Be ready to explain:** this is a rule-based/keyword matcher, not ML-based NLP — and what its limitations are (no semantic understanding, exact-match dependent, etc.)

### Phase 5 — Admin Module (Days 21–23)
- Admin: approve recruiters, approve job postings, manage students
- Placement statistics endpoint (aggregate SQL queries: total/eligible students, applications, shortlisted, selected, placement rate, avg/highest package)
- Admin dashboard (React) with Recharts visualizations

### Phase 6 — Polish & Interview-Readiness (Days 24–28)
- Input validation (Bean Validation / `@Valid`)
- Consistent error responses across all endpoints
- Basic unit tests (JUnit/Mockito) on service layer — especially `RecommendationService`
- README with architecture diagram, ER diagram, setup instructions
- Prepare a 2-minute verbal walkthrough + answers to likely interview questions (see below)

### Phase 7 — Stretch Goals (only if time remains)
- Email notifications on status change
- Swagger/OpenAPI docs
- Dockerize backend + frontend
- Deploy to AWS (EC2/RDS or Elastic Beanstalk)
- Redis caching for job listing queries
- CI/CD pipeline (GitHub Actions)

---

## 4. Minimum Viable Feature Set (do not cut below this)

- [ ] JWT auth + 3 roles with enforced authorization
- [ ] Student profile + resume upload
- [ ] Job posting + browsing + search/filter
- [ ] Apply + status tracking
- [ ] Skill-matching recommendation
- [ ] Admin approval + basic stats dashboard
- [ ] Clean error handling across all APIs

---

## 5. Anticipated Interview Questions to Prepare For

- Walk through what happens from login to a protected API call (JWT flow, filter chain, validation)
- Why this entity/table design? What breaks if you change it?
- How does the matching algorithm work, and what are its limitations?
- What happens if two recruiters shortlist the same candidate at once? (concurrency)
- How would this scale to 10,000 concurrent students?
- Why Spring Security over a custom auth solution?

---

## 6. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Scope creep across 3 roles | Lock MVP list above; treat everything else as stretch |
| Resume parsing turns into an NLP rabbit hole | Use rule-based skill-tag matching only; be upfront about this in interviews |
| Shallow, buggy demo under live questioning | Prioritize depth on core auth/API/DB layers over UI polish |
| Project looking generic vs. other candidates | Differentiate via explanation quality + one well-built standout feature, not feature count |