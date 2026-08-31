# SAPS Case Docket Accountability and Registration Integrity System

A software system to improve accountability, traceability, and integrity in the registration and management of South African Police Service (SAPS) case dockets.

## Project Overview

**Institution:** Durban University of Technology  
**Project Code:** SODM401 / SFEN301  
**Year:** 2026  
**Focus:** Unlawful Refusals, Accountability Gaps, Case Registration and Docket Traceability

### Problem Statement

The SAPS case-docket process faces challenges with:
- Unlawful refusals where victims are improperly turned away from registering complaints
- Accountability gaps where complainants cannot track docket movement or responsibility
- Inconsistent registration and transfer procedures
- Difficulty establishing who performed actions and when

### Solution Concept

An accountability-focused digital platform that maintains a traceable audit trail of:
- Case registration and responsible officials
- Docket access and movement
- Status changes and updates
- Final resolution and outcome
- Escalation and complaint linkage

## Project Structure

```
.
├── docs/                          # Documentation
│   ├── requirements/              # Requirements specifications
│   ├── architecture/              # System architecture diagrams
│   └── research/                  # Literature review & research findings
├── src/                           # Source code
│   ├── backend/                   # Backend application
│   ├── frontend/                  # Frontend application
│   ├── database/                  # Database schemas & migrations
│   └── api/                       # API endpoints
├── tests/                         # Test suites
├── deployment/                    # Deployment & configuration
└── README.md                      # This file
```

## Core Features

### 1. Authentication & Authorization
- Individual user accounts with role-based access control
- Secure authentication mechanism
- User role management (CSC Official, Detective, Commander, etc.)

### 2. Case Management
- Case registration with unique CAS reference
- Officer identification for all actions
- Automatic timestamping of all operations
- Case status tracking through lifecycle

### 3. Docket Tracking
- Docket allocation to responsible officials
- Docket transfer logging between units/stations
- Transfer acknowledgement recording
- Access logging for audit purposes

### 4. Accountability Trail
- Chronological audit log of all case actions
- Protected audit records against tampering
- User attribution for every action
- Timestamp verification

### 5. Reporting & Dashboards
- Management dashboards with key metrics
- Exception reporting for pending/overdue cases
- Accountability indicators and trends
- Customizable report generation

### 6. Complaint Linkage
- Link service complaints to relevant cases
- Escalation tracking and status
- Complaint resolution workflow
- Feedback loop to original complainants

## Technology Stack

### Backend
- **Framework:** Node.js/Express or Python/Django/FastAPI
- **Database:** PostgreSQL (relational, ACID compliance)
- **Cache:** Redis (for performance optimization)
- **Message Queue:** RabbitMQ/Kafka (for async operations)

### Frontend
- **Framework:** React or Vue.js
- **UI Library:** Material-UI or Ant Design
- **State Management:** Redux or Vuex
- **Testing:** Jest, React Testing Library

### Infrastructure
- **Containerization:** Docker
- **Orchestration:** Kubernetes
- **CI/CD:** GitHub Actions
- **Logging:** ELK Stack
- **Monitoring:** Prometheus & Grafana

### Security
- **Authentication:** JWT tokens
- **Encryption:** AES-256 for data at rest, TLS for data in transit
- **Access Control:** OAuth 2.0 / OpenID Connect
- **Secrets Management:** HashiCorp Vault

## Requirements Classification

### Functional Requirements (FR01-FR17)
- User authentication and role management
- Case registration with unique references
- Officer identification for actions
- Timestamping of significant events
- Docket allocation and tracking
- Access logging and auditability
- Case status updates
- Docket transfer recording with acknowledgement
- Escalation linkage
- Resolution recording
- Audit trail maintenance
- Management reports
- Search functionality
- Notifications

### Non-Functional Requirements (NFR01-NFR12)
- Security and access control
- Authentication and authorization
- Auditability and tamper-resistance
- Availability (99.5% uptime target)
- Performance (< 2 second response time)
- Usability and user training
- Reliability and data integrity
- Privacy (POPIA compliance)
- Maintainability and modularity
- Traceability
- Backup and disaster recovery

## Getting Started

### Prerequisites
- Node.js 16+ / Python 3.9+
- PostgreSQL 12+
- Docker & Docker Compose
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/NombhidaOthembele/SAPS-Case-Docket-Accountability-System.git
cd SAPS-Case-Docket-Accountability-System

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run database migrations
npm run migrate

# Start development server
npm start
```

## Contact

**Email:** nombhidaothembele@gmail.com  
**Institution:** Durban University of Technology, 79 Steve Biko Road, Durban, 4001

## License

MIT License - see LICENSE file for details.

---

**Last Updated:** August 31, 2026  
**Status:** Active Development