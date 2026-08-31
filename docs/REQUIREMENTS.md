# Requirements Specification

## Functional Requirements (FR01-FR17)

| ID | Function | Requirement Statement |
|---|---|---|
| FR01 | User authentication | The system must require authorized users to authenticate before accessing protected functions. |
| FR02 | Role management | The system must assign users role-based permissions according to approved responsibilities. |
| FR03 | Case registration | The system must allow an authorized official to register a reported case. |
| FR04 | Unique reference | The system must record a unique case/CAS reference for each registered case. |
| FR05 | Officer identification | The system must associate each registration with the user who performed it. |
| FR06 | Timestamping | The system must record the date and time of significant case actions. |
| FR07 | Docket allocation | The system must record the allocation of a docket to the responsible official or investigation unit. |
| FR08 | Docket access logging | The system must log authorized access to protected case information. |
| FR09 | Case updates | The system must allow authorized users to record case-status or investigation updates. |
| FR10 | Docket transfer | The system must record the movement/transfer of a docket between authorised users, units or stations. |
| FR11 | Transfer acknowledgement | The system must record acknowledgement of receipts after an authorized docket transfer. |
| FR12 | Escalation linkage | The system should allow an authorized complaint or escalation to be linked to the relevant case where appropriate. |
| FR13 | Resolution recording | The system must record the final case status and relevant resolution information. |
| FR14 | Audit trail | The system must maintain a chronological history of significant actions performed on each case. |
| FR15 | Management reports | The system should generate authorized reports on registration, transfers, outstanding cases and accountability indicators. |
| FR16 | Search | The system should allow authorized users to search for cases using approved criteria. |
| FR17 | Notifications | The system should notify authorized users of selected pending actions, overdue steps or transfer acknowledgements. |

## Non-Functional Requirements (NFR01-NFR12)

| ID | Category | Requirement Statement |
|---|---|---|
| NFR01 | Security | The system must protect case information from unauthorised access. |
| NFR02 | Authentication | Each user must have an individual identity that can be linked to system actions. |
| NFR03 | Authorisation | Users must only access functions and information appropriate to their role. |
| NFR04 | Auditability | Audit records must be protected against unauthorised alteration or deletion. |
| NFR05 | Availability | The system should be available during defined operational periods with planned maintenance clearly controlled. |
| NFR06 | Performance | Common case-registration and retrieval operations should return within 2 seconds. |
| NFR07 | Usability | Core registration tasks should be learnable with appropriate user training and should minimise avoidable input errors. |
| NFR08 | Reliability | The system must preserve committed transaction data under normal operating conditions. |
| NFR09 | Privacy | Personal information must be processed in accordance with applicable privacy requirements. |
| NFR10 | Maintainability | The system architecture should support future policy, workflow and integration changes. |
| NFR11 | Traceability | Each critical business transaction must be attributable to a user, time and case reference. |
| NFR12 | Backup and recovery | The system must support appropriate backup, recovery and continuity controls. |

## Domain Requirements

- The system must support the applicable case-registration and transfer procedures prescribed by SAPS policy and National Instruction 3/2011.
- The system should preserve the accountability relationships established by the operational process.
- The system must support controlled access to case information and protect personal information in accordance with applicable law and SAPS policy.
- The system should support operational continuity when the primary registration service is unavailable.
- The system must allow authorised supervisors to review registration and transfer activity.

## Data Requirements

Core entities to be managed:
- Users (authentication and roles)
- Cases (crime case records)
- Dockets (case file references)
- Assignments (responsibility tracking)
- Access Events (audit logging)
- Transfer Events (docket movement)
- Status Updates (case progress)
- Complaints (escalations)
- Resolutions (case completion)
- Audit Log (comprehensive history)
