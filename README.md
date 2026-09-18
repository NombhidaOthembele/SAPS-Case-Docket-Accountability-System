# SAPS Case Docket Accountability System

This project implements the SAPS six W's acceptance criteria and ensures that an investigator update is captured at every step of the workflow.

## What is included

- Case registration with all six W's:
  - Who
  - What
  - When
  - Where
  - Why
  - How
- Mandatory investigator update on every step
- Workflow updates for registration, allocation, investigation, transfer, commander review and resolution
- Station Commander acceptance check that blocks approval if any earlier event is missing the six W's or investigator update
- Browser-based front-end with localStorage persistence
- Simple API validation on the backend

## Run locally

```bash
npm install
npm start
```

Then open:

http://localhost:3000

## Test the API

### 1) Register a case

```bash
curl -X POST http://localhost:3000/api/cases/register \
  -H "Content-Type: application/json" \
  -d '{
    "station": "Durban Central SAPS",
    "complainantName": "Jane Doe",
    "offenceDetails": "Theft and malicious damage",
    "actorId": "csc-officer-01",
    "sixWs": {
      "who": "Community Service Centre Official 01",
      "what": "The case was reported and registered",
      "when": "2026-09-18T09:00:00",
      "where": "Durban Central SAPS",
      "why": "The complainant reported a theft incident",
      "how": "Statement captured and CAS record created"
    },
    "investigatorUpdate": "Initial statement captured and docket entered into the case system."
  }'
```

### 2) Add a workflow update

```bash
curl -X POST http://localhost:3000/api/cases/CASE-123/updates \
  -H "Content-Type: application/json" \
  -d '{
    "step": "investigation",
    "actorId": "investigator-01",
    "sixWs": {
      "who": "Detective Investigator 01",
      "what": "Investigative follow-up initiated",
      "when": "2026-09-18T10:00:00",
      "where": "Durban Central SAPS",
      "why": "Begin crime investigation checks",
      "how": "Witness interview and evidence review"
    },
    "investigatorUpdate": "Witness interview completed and evidence logged."
  }'
```

### 3) Commander acceptance

```bash
curl -X POST http://localhost:3000/api/cases/CASE-123/commander-acceptance \
  -H "Content-Type: application/json" \
  -d '{
    "actorId": "station-commander-01",
    "sixWs": {
      "who": "Station Commander",
      "what": "Final review and approval",
      "when": "2026-09-18T11:00:00",
      "where": "Durban Central SAPS",
      "why": "Case is ready for supervisory acceptance",
      "how": "Review of case timeline and evidence"
    },
    "investigatorUpdate": "All required steps completed and approved for commander review."
  }'
```

## Notes

- The browser app stores data in `localStorage`, so the information persists on refresh in the same browser.
- The backend uses in-memory storage only; this is a prototype for classroom validation and demonstration.
- To make this production-ready, replace the in-memory storage with PostgreSQL and implement secure authentication.
