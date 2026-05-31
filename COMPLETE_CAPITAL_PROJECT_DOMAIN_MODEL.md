# COMPLETE CAPITAL PROJECT DOMAIN MODEL

This document defines the **complete** data model, UI, agents, workflows, digital twins, approval flows, analytics, dashboards, APIs, mocks, and orchestration for every capital project entity based on IBM TRIRIGA Capital Project Management.

## IMPLEMENTATION PHILOSOPHY

**NO HUMAN DATA ENTRY** - Human interaction limited to:
- Approve
- Reject  
- Override
- Escalate

Everything else automated through agents:
- Create records
- Update records
- Generate tasks, meetings, milestones
- Generate reports, budgets, forecasts
- Generate risks, procurement actions
- Generate approvals, alerts
- Generate executive summaries

---

## TABLE OF CONTENTS

1. [Project Management](#1-project-management)
2. [Organization & Security](#2-organization--security)
3. [Capital Project Contacts](#3-capital-project-contacts)
4. [Funding Management](#4-funding-management)
5. [Budget Management](#5-budget-management)
6. [Cost Code Management](#6-cost-code-management)
7. [Procurement Management](#7-procurement-management)
8. [RFI/RFQ/RFP Management](#8-rfirfqrfp-management)
9. [Contract Management](#9-contract-management)
10. [Purchase Orders](#10-purchase-orders)
11. [Invoice Management](#11-invoice-management)
12. [Payment Management](#12-payment-management)
13. [Task Management](#13-task-management)
14. [Milestones](#14-milestones)
15. [Schedule Management](#15-schedule-management)
16. [Risk Management](#16-risk-management)
17. [Issue Management](#17-issue-management)
18. [Change Management](#18-change-management)
19. [Meeting Management](#19-meeting-management)
20. [Document Management](#20-document-management)
21. [Weather & External Impacts](#21-weather--external-impacts)
22. [Approval Framework](#22-approval-framework)
23. [Agent Automation](#23-agent-automation)
24. [Resiliency](#24-resiliency)
25. [Final State](#25-final-state)

---

## 1. PROJECT MANAGEMENT

### Core Entities

#### Capital Project
The central entity representing a capital project with complete lifecycle tracking.

**Key Fields:**
- Project identification (id, projectNumber, name)
- Classification (projectType, projectClassification, program, portfolio)
- Status tracking (phase, status, health)
- Timeline (planned/actual/forecast dates)
- Financial (budget, committed, actual, forecast, variance)
- Organization hierarchy (organization, businessUnit, region, site, facility)
- Contact hierarchy (executive, sponsor, manager, team)
- Security (securityScope, rowLevelSecurity)
- Digital twin integration

#### Project Template
Reusable templates for standardizing project setup.

**Includes:**
- Default phases, tasks, milestones
- Default approvals and budget categories
- Default cost codes and documents
- Project type association

#### Project Type
Classification system for different project categories.

**Examples:**
- New Construction
- Renovation
- Maintenance
- Infrastructure
- Equipment Installation

#### Project Phase
Lifecycle phases with status tracking.

**Standard Phases:**
- Planning
- Design
- Procurement
- Construction
- Closeout

#### Project Health
Real-time health monitoring across multiple dimensions.

**Health Indicators:**
- Overall health (Green/Yellow/Red)
- Schedule health
- Budget health
- Risk health
- Quality health
- Safety health

#### Project Digital Twin
Real-time digital representation with predictive analytics.

**Capabilities:**
- Real-time data integration
- Predictive analytics
- Simulation results
- Optimization recommendations

---

## 2. ORGANIZATION & SECURITY

### Security Model

**Row-Level Security:** Users can ONLY see records within their permitted:
- Organizations
- Geographies
- Sites
- Facilities
- Role scope

### Organizational Hierarchy

```
Organization
  └─ Business Unit
      └─ Department
          └─ Person
```

### Geographic Hierarchy

```
Region
  └─ Geography
      └─ Country
          └─ State
              └─ City
                  └─ Campus
                      └─ Site
                          └─ Facility
                              └─ Building
```

### Security Entities

#### Data Entitlements
Defines what entities a user can access based on:
- Role
- Organization membership
- Geographic scope
- Site/Facility access
- Project assignment

**Controlled Entities:**
- Projects
- Budgets
- Contracts
- Invoices
- Vendors
- Tasks
- Meetings
- Approvals
- Cost Codes

---

## 3. CAPITAL PROJECT CONTACTS

### Contact Hierarchy

Every project maintains a complete contact hierarchy:

**Executive Level:**
- Project Executive
- Project Sponsor

**Management Level:**
- Project Manager
- Program Manager
- Construction Manager
- Finance Manager
- Procurement Manager

**External Contacts:**
- Vendor Contacts
- Contractor Contacts
- Architect
- Engineer
- Consultant

**Stakeholders:**
- Approvers
- Stakeholders

### Contact Management
- Role-based assignments
- Primary/secondary designation
- Start/end dates
- Responsibility tracking
- Contact history

---

## 4. FUNDING MANAGEMENT

### Complete Funding Lifecycle

**Funding Request → Approval → Allocation → Utilization → Balance → Forecast**

### Key Entities

#### Funding Source
- Capital Budget
- Grants
- Loans
- Bonds
- Other sources

#### Funding Allocation
- Project-specific allocations
- Fiscal year tracking
- Approval workflows
- Status management

#### Funding Utilization
- Real-time consumption tracking
- Budget mapping
- Contract mapping
- PO mapping
- Invoice mapping

#### Funding Balance
- Total allocated
- Total utilized
- Total committed
- Available balance
- As-of-date tracking

---

## 5. BUDGET MANAGEMENT

### Enhanced Budget System

**Original Budget Estimates** are part of project planning phase.

### Budget Hierarchy

```
Budget
  └─ Budget Version (Baseline, Revision, Forecast)
      └─ Budget Line Item
          ├─ Budget Category
          ├─ Cost Code
          └─ Funding Source
```

### Budget Tracking

**Financial Metrics:**
- Total budget
- Committed amount
- Actual amount
- Remaining amount
- Variance (amount and percent)

### Budget Processes

1. **Budget Creation** - Initial budget setup
2. **Budget Baseline** - Approved baseline for comparison
3. **Budget Revision** - Formal changes with approvals
4. **Budget Adjustment** - Line item transfers
5. **Budget Forecast** - Predictive projections
6. **Budget Consumption** - Real-time utilization
7. **Budget Snapshot** - Point-in-time captures
8. **Budget Audit** - Complete change history

---

## 6. COST CODE MANAGEMENT

### Cost Code Hierarchy

TRIRIGA-style parent-child rollups with multiple dimensions:

#### Cost Code Types

1. **Organization Cost Code**
   - Organization
   - Business Unit
   - Department
   - Cost Center

2. **Location Cost Code**
   - Geography
   - Site
   - Facility
   - Building

3. **Service Cost Code**
   - Service Category
   - Service Type

4. **Project Cost Code**
   - Project-specific codes
   - Mapped to standard codes

5. **Standard Capital Project Cost Code**
   - Design
   - Construction
   - Equipment
   - Soft Costs
   - CSI Division mapping
   - Uniformat mapping

### Cost Code Features

- **Hierarchical Rollups** - Parent-child aggregation
- **Cost Code Allocation** - Budget/project mapping
- **Cost Code Analytics** - Trend analysis and forecasting
- **Cost Code Governance** - Approval rules and restrictions

---

## 7. PROCUREMENT MANAGEMENT

### Vendor Management

**Complete vendor lifecycle:**
- Vendor qualification
- Vendor evaluation
- Vendor risk assessment
- Vendor performance tracking
- Vendor digital twin

### Bid Management

**Bid Package Process:**
1. Create bid package
2. Prequalify vendors
3. Release to vendors
4. Receive bids
5. Clarifications
6. Evaluation
7. Recommendation
8. Award decision

### Vendor Performance

**Performance Metrics:**
- Quality score
- Schedule score
- Cost score
- Safety score
- Overall score

---

## 8. RFI/RFQ/RFP MANAGEMENT

### Request Types

#### RFI (Request for Information)
- Information gathering
- Market research
- Vendor capabilities

#### RFQ (Request for Quotation)
- Price quotes
- Delivery terms
- Standard items

#### RFP (Request for Proposal)
- Complex procurements
- Technical proposals
- Financial proposals
- Evaluation matrix
- Scoring system
- Recommendation process
- Award decision

### Evaluation Framework

**Evaluation Matrix:**
- Technical criteria
- Financial criteria
- Compliance criteria
- Weighted scoring
- Multiple evaluators

---

## 9. CONTRACT MANAGEMENT

### Contract Types

1. **Standard Contract** - Template-based contracts
2. **Master Contract** - Multi-project agreements
3. **Project Contract** - Project-specific contracts

### Contract Features

**Complete contract lifecycle:**
- Contract creation
- Contract amendments
- Contract changes
- Contract approvals
- Contract risk management
- Contract digital twin

### Contract Mappings

**Triple Mapping System:**
1. **Budget Mapping** - Contract to budget line items
2. **Cost Code Mapping** - Contract to cost codes
3. **Funding Mapping** - Contract to funding sources

---

## 10. PURCHASE ORDERS

### PO Management

**Complete PO lifecycle:**
- PO creation
- PO line items (with full detail)
- PO revisions
- PO approvals
- PO receipts
- PO status tracking
- PO audit trail

### PO Line Item Details

Each line item contains:
- Description
- Quantity, Unit, Rate
- Tax, Discount, Total
- Cost Code
- Funding Source
- Budget Line
- Vendor
- Delivery date
- Receipt tracking

### PO Allocations

**Triple Allocation:**
1. **Cost Allocation** - Map to cost codes
2. **Funding Allocation** - Map to funding sources
3. **Budget Allocation** - Map to budget lines

---

## 11. INVOICE MANAGEMENT

### Invoice Processing

**Automated invoice workflow:**
1. Invoice receipt
2. Invoice validation
3. Invoice matching (2-way or 3-way)
4. Exception handling
5. Approval routing
6. Payment processing

### Invoice Line Items

Complete line item tracking:
- Description
- Quantity, Rate, Amount
- Tax, Retention
- Cost Code
- Funding Source
- Budget Line
- PO Reference
- Contract Reference
- Vendor

### Invoice Validation

**Validation Rules:**
- PO matching
- Contract matching
- Budget availability
- Funding availability
- Approval limits
- Tax calculations
- Retention calculations

### Invoice Digital Twin

Real-time invoice analytics and predictions.

---

## 12. PAYMENT MANAGEMENT

### Payment Processing

**Complete payment lifecycle:**
- Payment creation
- Payment approval
- Payment release
- Payment reconciliation
- Payment audit

### Cash Flow Management

**Cash Flow Features:**
- Payment schedule
- Payment forecast
- Cash flow analysis
- Payment variance tracking

---

## 13. TASK MANAGEMENT

### Task Features

**Enhanced task system:**
- Task templates
- Task dependencies (predecessor/successor)
- Task assignments
- Task approvals
- Task completion tracking
- Task escalation
- Task audit trail
- Task digital twin

### Dependency Network

**Full dependency support:**
- Finish-to-Start
- Start-to-Start
- Finish-to-Finish
- Start-to-Finish
- Lag time
- Lead time

---

## 14. MILESTONES

### Milestone Management

**Milestone tracking:**
- Milestone definition
- Milestone dependencies
- Milestone tracking
- Milestone forecast
- Milestone variance
- Milestone health
- Milestone approvals
- Milestone analytics

---

## 15. SCHEDULE MANAGEMENT

### Schedule Features

**Complete schedule management:**
- Project schedule
- Master schedule
- Schedule baseline
- Schedule variance
- Schedule forecast
- Schedule delay detection
- Schedule risk
- Schedule recovery plan
- Gantt view
- Critical path analysis
- Schedule agent automation

---

## 16. RISK MANAGEMENT

### Risk Framework

**Complete risk management:**
- Risk identification
- Risk category
- Risk severity
- Risk probability
- Risk impact
- Risk mitigation
- Risk escalation
- Risk approval
- Risk audit
- Risk register
- Risk heat map
- Risk forecast
- Risk agent automation

---

## 17. ISSUE MANAGEMENT

### Issue Tracking

**Issue management:**
- Issue identification
- Issue resolution
- Issue escalation
- Issue approval
- Issue impact analysis
- Issue root cause
- Issue timeline
- Issue agent automation

---

## 18. CHANGE MANAGEMENT

### Change Control

**Change management process:**
- Change Request
- Change Order
- Potential Change Order (PCO)
- Approved/Rejected changes
- Budget impact analysis
- Schedule impact analysis
- Approval flow
- Audit history

---

## 19. MEETING MANAGEMENT

### Meeting Features

**Complete meeting management:**
- Meeting scheduling
- Meeting types
- Meeting attendees
- Meeting agenda
- Meeting minutes
- Meeting recording
- Meeting decisions
- Meeting action items
- Meeting follow-ups
- Meeting agent automation

---

## 20. DOCUMENT MANAGEMENT

### Document Types

**Project documents:**
- Documents
- Drawings
- Specifications
- Permits
- Photos
- Inspections
- Submittals
- Attachments

### Document Features

- Version control
- Revision tracking
- Approval workflows
- Document digital twin

---

## 21. WEATHER & EXTERNAL IMPACTS

### Weather Tracking

**Weather impact analysis:**
- Weather records
- Weather forecasts
- Weather alerts
- Site weather history
- Weather delay analysis
- Weather risk prediction
- Weather impact dashboard
- Project delay correlation

---

## 22. APPROVAL FRAMEWORK

### Approval System

**Comprehensive approval framework:**
- Approval templates
- Approval chains
- Approval rules
- Approval matrix
- Conditional approvals
- Escalation rules
- Auto-approval rules
- Delegation rules
- Approval audit trail

### Approval Types

Approvals required for:
- Projects
- Budgets
- Funding
- Contracts
- Purchase Orders
- Invoices
- Payments
- Changes
- Risks
- Tasks
- Milestones

---

## 23. AGENT AUTOMATION

### Agent Responsibilities

**Agents handle ALL data entry:**
- Create records
- Update records
- Generate tasks
- Generate meetings
- Generate milestones
- Generate reports
- Generate budgets
- Generate forecasts
- Generate risks
- Generate procurement actions
- Generate approvals
- Generate alerts
- Generate executive summaries

### Human Actions

**Humans ONLY:**
- Approve
- Reject
- Override
- Escalate

---

## 24. RESILIENCY

### Resiliency Patterns

**Every agent action supports:**
- Retry logic
- Rollback capability
- Recovery procedures
- Compensation transactions
- Audit logging
- Observability
- Distributed tracing
- Failure queue
- Dead letter queue
- Manual replay

---

## 25. FINAL STATE

### Complete Automation

When development is complete, a user should be able to **create a capital project** and the platform automatically orchestrates:

**Funding** → **Budget** → **Cost Codes** → **Procurement** → **RFQ/RFP** → **Vendor Selection** → **Contracts** → **Purchase Orders** → **Invoices** → **Payments** → **Tasks** → **Meetings** → **Risks** → **Reporting** → **Closeout**

**With only approval decisions requiring human action.**

### MREF/TRIRIGA Integration

The only remaining implementation work should be:
- Mapping actual MREF/TRIRIGA OSLC endpoints
- Mapping field names
- Configuring authentication
- Testing data flows

---

## IMPLEMENTATION PRIORITY

### Phase 1: Foundation (Weeks 1-4)
1. Organization & Security framework
2. Project Management core entities
3. Contact management
4. Approval framework

### Phase 2: Financial (Weeks 5-8)
5. Funding Management
6. Budget Management (enhance existing)
7. Cost Code Management

### Phase 3: Procurement (Weeks 9-12)
8. Vendor Management
9. RFI/RFQ/RFP system
10. Contract Management
11. Purchase Orders

### Phase 4: Execution (Weeks 13-16)
12. Invoice Management
13. Payment Management
14. Task Management (enhance existing)
15. Milestones
16. Schedule Management

### Phase 5: Risk & Quality (Weeks 17-20)
17. Risk Management
18. Issue Management
19. Change Management
20. Document Management

### Phase 6: Collaboration (Weeks 21-24)
21. Meeting Management
22. Weather & External Impacts
23. Agent Automation (all entities)
24. Resiliency patterns

### Phase 7: Integration (Weeks 25-28)
25. Orchestration workflows
26. UI components (all entities)
27. Analytics dashboards
28. Digital twins (all entities)

### Phase 8: Testing & Deployment (Weeks 29-32)
29. API mocks (all entities)
30. MREF/OSLC mapping
31. End-to-end testing
32. Production deployment

---

## SUCCESS CRITERIA

✅ **Zero manual data entry** except approvals
✅ **Complete entity coverage** per TRIRIGA
✅ **Full automation** via agents
✅ **Complete audit trails** for all changes
✅ **Row-level security** enforced
✅ **Real-time digital twins** operational
✅ **Predictive analytics** functioning
✅ **End-to-end orchestration** working
✅ **MREF integration** ready for mapping

---

*This document serves as the complete specification for implementing a world-class Capital Project Management system based on IBM TRIRIGA standards.*