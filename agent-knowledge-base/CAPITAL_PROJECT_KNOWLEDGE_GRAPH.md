# Capital Project Knowledge Graph Architecture

**Version**: 2.0  
**Paradigm Shift**: From Project-Centric to Knowledge Graph-Based Operating System  
**Target**: Enterprise Capital Project Management with Full Governance

---

## CRITICAL ARCHITECTURAL CHANGE

### ⚠️ DO NOT BUILD AROUND CAPITAL PROJECTS ONLY

**Build around a Capital Project Knowledge Graph where every object is connected:**

- Capital Project
- Budget & Funding Sources
- Vendors & Contracts
- Purchase Orders & Invoices
- Tasks & Milestones
- Meetings & Approvals
- Drawings & Documents
- Risks & Issues

**Agents analyze relationships between objects, not individual records.**

This Knowledge Graph becomes the foundation for:
- Autonomous planning
- Intelligent procurement
- Dynamic budgeting
- Automated governance
- Predictive forecasting
- Smart approvals
- Coordinated execution

---

## KNOWLEDGE GRAPH STRUCTURE

```
                    ┌─────────────────────────────────────┐
                    │      CAPITAL PROJECT GRAPH          │
                    │    (Central Knowledge Store)        │
                    └─────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
   ┌────▼────┐                 ┌───▼────┐                 ┌───▼────┐
   │ Project │                 │ Budget │                 │Contract│
   │  Node   │◄───────────────►│  Node  │◄───────────────►│  Node  │
   └────┬────┘                 └───┬────┘                 └───┬────┘
        │                          │                          │
        │                          │                          │
   ┌────▼────┐                 ┌───▼────┐                 ┌───▼────┐
   │  Task   │                 │Funding │                 │Vendor  │
   │  Node   │                 │ Source │                 │  Node  │
   └────┬────┘                 └───┬────┘                 └───┬────┘
        │                          │                          │
        │                          │                          │
   ┌────▼────┐                 ┌───▼────┐                 ┌───▼────┐
   │Milestone│                 │  Cost  │                 │   PO   │
   │  Node   │                 │  Code  │                 │  Node  │
   └────┬────┘                 └────────┘                 └───┬────┘
        │                                                      │
        │                                                      │
   ┌────▼────┐                                            ┌───▼────┐
   │Resource │                                            │Invoice │
   │  Node   │                                            │  Node  │
   └─────────┘                                            └────────┘

        ┌───────────────────────────────────────────────┐
        │         GOVERNANCE & COMPLIANCE LAYER         │
        ├───────────────────────────────────────────────┤
        │  Approvals │ Meetings │ Risks │ Documents    │
        └───────────────────────────────────────────────┘
```

---

## COMPLETE OBJECT CATALOG

### 1. PROJECT GOVERNANCE OBJECTS

#### Capital Project
**Purpose**: Core project entity with full lifecycle management

**Key Fields**:
- Project ID, Name, Description
- Status, Phase, Priority
- Start/End Dates, Duration
- Budget (Original, Revised, Actual)
- Completion Percentage
- Risk Level, Health Score
- Project Manager, Sponsor
- Program Association

**Relationships**:
- Belongs to: Capital Program
- Has many: Tasks, Milestones, Budgets, Contracts, Documents
- Associated with: Buildings, Organizations, Funding Sources
- Tracked by: Risks, Issues, Change Requests

#### Project Change Request
**Purpose**: Formal change management for scope, budget, or timeline

**Key Fields**:
- Change Request ID, Title
- Change Type (Scope, Budget, Schedule)
- Requested By, Date
- Impact Assessment
- Justification
- Approval Status
- Approved By, Date

**Relationships**:
- Belongs to: Capital Project
- Affects: Budget, Schedule, Scope
- Requires: Approvals
- Generates: Amendments

#### Project Amendment
**Purpose**: Approved modifications to project baseline

**Key Fields**:
- Amendment ID, Number
- Amendment Type
- Original vs. Revised Values
- Effective Date
- Approval Chain
- Supporting Documents

**Relationships**:
- Belongs to: Capital Project
- Originated from: Change Request
- Updates: Budget, Schedule, Scope
- Documented in: Audit Trail

#### Project Closure
**Purpose**: Formal project completion and handover

**Key Fields**:
- Closure Date
- Final Budget vs. Actual
- Final Schedule vs. Actual
- Deliverables Completed
- Lessons Learned
- Closeout Documents
- Final Approvals

**Relationships**:
- Belongs to: Capital Project
- References: All Project Artifacts
- Generates: Final Reports
- Archives: Documents

#### Project Phase Gate Reviews
**Purpose**: Stage-gate governance checkpoints

**Key Fields**:
- Phase Gate ID
- Phase Name (Initiation, Planning, Execution, Closeout)
- Review Date
- Gate Criteria
- Pass/Fail Status
- Reviewer Comments
- Decision (Proceed, Hold, Cancel)

**Relationships**:
- Belongs to: Capital Project
- Evaluated by: Steering Committee
- Generates: Action Items
- Gates: Next Phase

#### Project Approval Templates
**Purpose**: Standardized approval workflows

**Key Fields**:
- Template ID, Name
- Approval Type
- Approval Levels
- Threshold Amounts
- Required Approvers
- Escalation Rules
- SLA Timelines

**Relationships**:
- Applied to: Projects, Budgets, Contracts, Changes
- Defines: Approval Workflow
- Enforces: Governance Rules

---

### 2. BUDGET MANAGEMENT OBJECTS

#### Budget Header
**Purpose**: Top-level budget container for a project

**Key Fields**:
- Budget ID, Name
- Fiscal Year
- Budget Type (Capital, Operating)
- Total Amount
- Status (Draft, Approved, Active, Closed)
- Approval Date
- Budget Owner

**Relationships**:
- Belongs to: Capital Project
- Contains: Budget Line Items
- Funded by: Funding Sources
- Tracked by: Budget Revisions

#### Budget Line Items
**Purpose**: Detailed budget allocations by category

**Key Fields**:
- Line Item ID
- Cost Category (Labor, Materials, Equipment, etc.)
- Cost Code
- Budgeted Amount
- Committed Amount
- Actual Amount
- Variance
- Forecast Amount

**Relationships**:
- Belongs to: Budget Header
- Categorized by: Cost Codes
- Consumed by: Purchase Orders, Invoices
- Tracked by: Cost Records

#### Funding Sources
**Purpose**: Origin of project funding

**Key Fields**:
- Funding Source ID, Name
- Funding Type (Grant, Bond, Operating Budget)
- Total Available
- Allocated Amount
- Remaining Balance
- Restrictions/Conditions
- Expiration Date

**Relationships**:
- Funds: Capital Projects, Budgets
- Managed by: Finance Department
- Tracked by: Financial Reports

#### Cost Codes
**Purpose**: Standardized cost categorization

**Key Fields**:
- Cost Code ID, Code
- Description
- Category (Labor, Materials, Equipment, Services)
- GL Account Mapping
- Active/Inactive Status

**Relationships**:
- Applied to: Budget Line Items, Cost Records
- Maps to: General Ledger
- Used by: Financial Reporting

#### Budget Transfers
**Purpose**: Movement of funds between budget lines

**Key Fields**:
- Transfer ID
- From Budget Line
- To Budget Line
- Transfer Amount
- Transfer Date
- Reason/Justification
- Approval Status
- Approved By

**Relationships**:
- Affects: Budget Line Items
- Requires: Approvals
- Tracked in: Audit Trail

#### Budget Revisions
**Purpose**: Formal budget modifications

**Key Fields**:
- Revision ID, Number
- Revision Type (Increase, Decrease, Reallocation)
- Original Amount
- Revised Amount
- Change Amount
- Effective Date
- Approval Status
- Justification

**Relationships**:
- Belongs to: Budget Header
- Modifies: Budget Line Items
- Requires: Approvals
- Generates: Change Requests

#### Budget Approval Templates
**Purpose**: Budget-specific approval workflows

**Key Fields**:
- Template ID
- Budget Threshold Ranges
- Approval Levels
- Required Approvers by Amount
- Escalation Rules
- Auto-approval Conditions

**Relationships**:
- Applied to: Budgets, Revisions, Transfers
- Enforces: Financial Controls
- Routes to: Approvers

---

### 3. PROCUREMENT OBJECTS

#### Purchase Requisition (PR)
**Purpose**: Internal request to purchase goods/services

**Key Fields**:
- PR ID, Number
- Requestor, Department
- Request Date
- Required By Date
- Total Amount
- Status (Draft, Submitted, Approved, Converted)
- Justification
- Priority

**Relationships**:
- Belongs to: Capital Project
- Contains: PR Line Items
- Converts to: Purchase Order
- Requires: Approvals

#### Purchase Requisition Line Items
**Purpose**: Individual items on a PR

**Key Fields**:
- Line Item ID
- Item Description
- Quantity
- Unit Price
- Total Price
- Cost Code
- Vendor Preference
- Delivery Date

**Relationships**:
- Belongs to: Purchase Requisition
- Maps to: Budget Line Items
- Becomes: PO Line Items

#### Request for Information (RFI)
**Purpose**: Gather vendor information and capabilities

**Key Fields**:
- RFI ID, Number
- Title, Description
- Issue Date
- Response Deadline
- Scope of Work
- Evaluation Criteria
- Status

**Relationships**:
- Belongs to: Capital Project
- Sent to: Vendors
- Generates: Vendor Responses
- Leads to: RFP/RFQ

#### Request for Proposal (RFP)
**Purpose**: Solicit detailed proposals from vendors

**Key Fields**:
- RFP ID, Number
- Title, Description
- Issue Date
- Submission Deadline
- Estimated Value
- Scope of Work
- Evaluation Criteria
- Status

**Relationships**:
- Belongs to: Capital Project
- Sent to: Vendors
- Receives: Bid Responses
- Results in: Vendor Selection

#### Request for Quotation (RFQ)
**Purpose**: Request price quotes for specific items

**Key Fields**:
- RFQ ID, Number
- Title, Description
- Issue Date
- Quote Deadline
- Item Specifications
- Quantity Required
- Delivery Requirements
- Status

**Relationships**:
- Belongs to: Capital Project
- Sent to: Vendors
- Receives: Bid Responses
- Converts to: Purchase Order

#### Bid Responses
**Purpose**: Vendor submissions to RFI/RFP/RFQ

**Key Fields**:
- Response ID
- Vendor ID
- Submission Date
- Proposed Price
- Delivery Timeline
- Technical Approach
- References
- Compliance Status

**Relationships**:
- Responds to: RFI/RFP/RFQ
- Submitted by: Vendor
- Evaluated in: Vendor Evaluation
- May become: Contract

#### Vendor Evaluation
**Purpose**: Systematic vendor assessment

**Key Fields**:
- Evaluation ID
- Vendor ID
- Evaluation Date
- Scoring Criteria
- Technical Score
- Price Score
- Overall Score
- Recommendation
- Evaluator Comments

**Relationships**:
- Evaluates: Bid Responses
- Scores: Vendors
- Recommends: Vendor Selection
- Supports: Contract Award

#### Purchase Orders (PO)
**Purpose**: Formal commitment to purchase

**Key Fields**:
- PO ID, Number
- Vendor ID
- PO Date
- Delivery Date
- Total Amount
- Status (Open, Partially Received, Closed)
- Payment Terms
- Shipping Terms

**Relationships**:
- Belongs to: Capital Project
- Issued to: Vendor
- Contains: PO Line Items
- Generates: Goods Receipts, Invoices
- Consumes: Budget

#### PO Line Items
**Purpose**: Individual items on a PO

**Key Fields**:
- Line Item ID
- Item Description
- Quantity Ordered
- Quantity Received
- Unit Price
- Total Price
- Cost Code
- Delivery Status

**Relationships**:
- Belongs to: Purchase Order
- Maps to: Budget Line Items
- Tracked by: Goods Receipts
- Invoiced via: Invoice Line Items

#### Goods Receipt
**Purpose**: Confirmation of delivery

**Key Fields**:
- Receipt ID, Number
- PO Reference
- Receipt Date
- Received By
- Quantity Received
- Condition
- Discrepancies
- Acceptance Status

**Relationships**:
- Belongs to: Purchase Order
- Updates: PO Line Items
- Triggers: Invoice Matching
- Recorded by: Receiving Department

---

### 4. CONTRACT MANAGEMENT OBJECTS

#### Contract
**Purpose**: Legal agreement with vendor/contractor

**Key Fields**:
- Contract ID, Number
- Contract Type (Fixed Price, Time & Materials, etc.)
- Vendor ID
- Start Date, End Date
- Contract Value
- Status (Draft, Active, Expired, Terminated)
- Payment Terms
- Performance Metrics

**Relationships**:
- Belongs to: Capital Project
- Awarded to: Vendor
- Contains: Contract Line Items
- Generates: Contract Amendments, Renewals
- Tracked by: Contract Deliverables

#### Contract Line Items
**Purpose**: Specific deliverables or services in contract

**Key Fields**:
- Line Item ID
- Description
- Quantity/Scope
- Unit Price
- Total Value
- Delivery Schedule
- Acceptance Criteria
- Status

**Relationships**:
- Belongs to: Contract
- Maps to: Budget Line Items
- Tracked by: Deliverables
- Invoiced via: Invoice Line Items

#### Contract Amendments
**Purpose**: Modifications to existing contracts

**Key Fields**:
- Amendment ID, Number
- Amendment Type (Scope, Price, Timeline)
- Original Terms
- Revised Terms
- Change Amount
- Effective Date
- Approval Status
- Justification

**Relationships**:
- Modifies: Contract
- Requires: Approvals
- Updates: Contract Value, Terms
- Documented in: Audit Trail

#### Contract Renewals
**Purpose**: Extension of expiring contracts

**Key Fields**:
- Renewal ID
- Original Contract ID
- Renewal Term
- Renewal Value
- Renewal Date
- Approval Status
- Terms Changes

**Relationships**:
- Extends: Contract
- Requires: Approvals
- Creates: New Contract Period
- Maintains: Vendor Relationship

#### Contract Approvals
**Purpose**: Contract-specific approval workflow

**Key Fields**:
- Approval ID
- Contract ID
- Approval Level
- Approver
- Approval Date
- Decision (Approved, Rejected, Pending)
- Comments

**Relationships**:
- Belongs to: Contract
- Follows: Approval Template
- Tracked in: Approval History
- Gates: Contract Execution

#### Contract Deliverables
**Purpose**: Specific outputs required from contract

**Key Fields**:
- Deliverable ID
- Description
- Due Date
- Completion Date
- Status (Pending, In Progress, Completed, Rejected)
- Acceptance Criteria
- Quality Metrics

**Relationships**:
- Belongs to: Contract
- Tracked by: Project Manager
- Triggers: Payments
- Documented in: Deliverable Records

---

### 5. FINANCIAL OBJECTS

#### Invoice
**Purpose**: Vendor bill for goods/services

**Key Fields**:
- Invoice ID, Number
- Vendor ID
- Invoice Date
- Due Date
- Total Amount
- Status (Received, Matched, Approved, Paid)
- Payment Terms
- PO Reference

**Relationships**:
- Belongs to: Vendor
- References: Purchase Order, Contract
- Contains: Invoice Line Items
- Generates: Payment Requests
- Matched to: Goods Receipts

#### Invoice Line Items
**Purpose**: Individual charges on an invoice

**Key Fields**:
- Line Item ID
- Description
- Quantity
- Unit Price
- Total Price
- Cost Code
- PO Line Reference
- Tax Amount

**Relationships**:
- Belongs to: Invoice
- Matches to: PO Line Items
- Charged to: Budget Line Items
- Tracked by: Cost Records

#### Payment Requests
**Purpose**: Request for payment processing

**Key Fields**:
- Payment Request ID
- Invoice Reference
- Payment Amount
- Requested By
- Request Date
- Payment Method
- Status (Pending, Approved, Processed)

**Relationships**:
- Belongs to: Invoice
- Requires: Payment Approvals
- Generates: Payment
- Tracked in: Payment History

#### Payment Approvals
**Purpose**: Authorization to release payment

**Key Fields**:
- Approval ID
- Payment Request ID
- Approver
- Approval Date
- Decision
- Comments
- Approval Level

**Relationships**:
- Belongs to: Payment Request
- Follows: Approval Template
- Gates: Payment Processing
- Tracked in: Audit Trail

#### Accruals
**Purpose**: Recognition of expenses before payment

**Key Fields**:
- Accrual ID
- Period
- Amount
- Cost Code
- Description
- Status
- Reversal Date

**Relationships**:
- Belongs to: Capital Project
- Affects: Budget Line Items
- Tracked in: Financial Reports
- Reversed by: Actual Payments

#### Commitments
**Purpose**: Obligated but not yet spent funds

**Key Fields**:
- Commitment ID
- Commitment Type (PO, Contract)
- Amount
- Date
- Status
- Release Date

**Relationships**:
- Belongs to: Capital Project
- Created by: Purchase Orders, Contracts
- Reduces: Available Budget
- Tracked in: Budget Reports

#### Forecasts
**Purpose**: Projected future costs

**Key Fields**:
- Forecast ID
- Period
- Forecasted Amount
- Confidence Level
- Assumptions
- Forecast Date
- Forecaster

**Relationships**:
- Belongs to: Capital Project, Budget
- Based on: Historical Data, Trends
- Compared to: Actual Costs
- Updated: Periodically

---

### 6. EXECUTION MANAGEMENT OBJECTS

#### Tasks
**Purpose**: Granular work items

**Key Fields**:
- Task ID, Name
- Description
- Start Date, End Date
- Duration
- Status (Not Started, In Progress, Completed)
- Assigned To
- Completion Percentage
- Estimated Cost, Actual Cost

**Relationships**:
- Belongs to: Capital Project
- Has: Dependencies
- Assigned to: Resources
- Tracked by: Milestones
- Generates: Time Entries, Cost Records

#### Task Templates
**Purpose**: Reusable task structures

**Key Fields**:
- Template ID, Name
- Task List
- Default Durations
- Default Dependencies
- Default Resources
- Applicable Project Types

**Relationships**:
- Applied to: Capital Projects
- Generates: Tasks
- Standardizes: Project Execution

#### Milestones
**Purpose**: Key project checkpoints

**Key Fields**:
- Milestone ID, Name
- Target Date
- Actual Date
- Status (Upcoming, Achieved, Missed)
- Importance (Critical, High, Medium, Low)
- Dependencies

**Relationships**:
- Belongs to: Capital Project
- Marks: Task Completion
- Triggers: Phase Gates
- Tracked in: Schedule Reports

#### Work Packages
**Purpose**: Grouped tasks for management

**Key Fields**:
- Work Package ID, Name
- Description
- Start Date, End Date
- Budget Allocation
- Responsible Party
- Status

**Relationships**:
- Belongs to: Capital Project
- Contains: Tasks
- Assigned to: Teams
- Tracked by: Progress Reports

#### Dependencies
**Purpose**: Task relationships and sequencing

**Key Fields**:
- Dependency ID
- Predecessor Task
- Successor Task
- Dependency Type (Finish-to-Start, etc.)
- Lag Time
- Status

**Relationships**:
- Links: Tasks
- Defines: Critical Path
- Affects: Schedule
- Tracked by: Schedule Agent

#### Schedules
**Purpose**: Project timeline management

**Key Fields**:
- Schedule ID
- Baseline Start/End
- Current Start/End
- Variance
- Critical Path
- Float/Slack
- Status

**Relationships**:
- Belongs to: Capital Project
- Contains: Tasks, Milestones
- Tracked by: Schedule Updates
- Analyzed by: Schedule Agent

#### Resource Assignments
**Purpose**: Allocation of people/equipment to tasks

**Key Fields**:
- Assignment ID
- Resource ID
- Task ID
- Allocation Percentage
- Start Date, End Date
- Estimated Hours
- Actual Hours

**Relationships**:
- Assigns: Resources to Tasks
- Tracks: Resource Utilization
- Affects: Resource Availability
- Generates: Time Entries

---

### 7. MEETINGS & GOVERNANCE OBJECTS

#### Meeting Records
**Purpose**: Documentation of project meetings

**Key Fields**:
- Meeting ID
- Meeting Type (Status, Steering, Review)
- Date, Time
- Location/Virtual Link
- Attendees
- Agenda
- Status

**Relationships**:
- Belongs to: Capital Project
- Generates: Meeting Minutes, Action Items
- Attended by: Stakeholders
- Tracked in: Meeting History

#### Meeting Minutes
**Purpose**: Official record of meeting discussions

**Key Fields**:
- Minutes ID
- Meeting ID
- Date
- Attendees Present
- Discussion Summary
- Decisions Made
- Next Steps

**Relationships**:
- Belongs to: Meeting Record
- Generates: Action Items
- Distributed to: Attendees
- Archived in: Document Management

#### Action Items
**Purpose**: Tasks arising from meetings

**Key Fields**:
- Action Item ID
- Description
- Assigned To
- Due Date
- Status (Open, In Progress, Completed)
- Priority
- Source Meeting

**Relationships**:
- Generated by: Meeting Minutes
- Assigned to: People
- Tracked in: Action Item Log
- May become: Tasks

#### Steering Committee Reviews
**Purpose**: Executive oversight meetings

**Key Fields**:
- Review ID
- Review Date
- Committee Members
- Projects Reviewed
- Decisions Made
- Recommendations
- Next Review Date

**Relationships**:
- Reviews: Capital Projects
- Attended by: Executives
- Generates: Action Items, Decisions
- Documented in: Meeting Minutes

#### Governance Reviews
**Purpose**: Compliance and policy checks

**Key Fields**:
- Review ID
- Review Type (Financial, Technical, Compliance)
- Review Date
- Reviewer
- Findings
- Recommendations
- Status

**Relationships**:
- Reviews: Capital Projects
- Identifies: Issues, Risks
- Generates: Corrective Actions
- Tracked in: Governance Log

#### Approval Boards
**Purpose**: Formal approval bodies

**Key Fields**:
- Board ID, Name
- Board Type (Budget, Contract, Change)
- Members
- Meeting Schedule
- Approval Authority
- Quorum Requirements

**Relationships**:
- Approves: Projects, Budgets, Contracts, Changes
- Consists of: Executives, Stakeholders
- Follows: Approval Templates
- Documented in: Approval Records

---

### 8. ENGINEERING & CONSTRUCTION OBJECTS

#### Drawings
**Purpose**: Technical design documents

**Key Fields**:
- Drawing ID, Number
- Drawing Type (Architectural, Structural, MEP)
- Title
- Scale
- Date
- Status (Draft, Approved, As-Built)
- Discipline

**Relationships**:
- Belongs to: Capital Project
- Has: Drawing Revisions
- Requires: Drawing Approvals
- Referenced by: Construction Documents

#### Drawing Revisions
**Purpose**: Version control for drawings

**Key Fields**:
- Revision ID
- Drawing ID
- Revision Number
- Revision Date
- Changes Description
- Revised By
- Status

**Relationships**:
- Belongs to: Drawing
- Supersedes: Previous Revision
- Requires: Approvals
- Tracked in: Revision History

#### Drawing Approvals
**Purpose**: Formal approval of drawings

**Key Fields**:
- Approval ID
- Drawing ID
- Approver
- Approval Date
- Decision
- Comments
- Approval Type (Design, Construction)

**Relationships**:
- Belongs to: Drawing
- Follows: Approval Workflow
- Gates: Construction
- Tracked in: Approval Log

#### Engineering Documents
**Purpose**: Technical specifications and calculations

**Key Fields**:
- Document ID
- Document Type (Specification, Calculation, Report)
- Title
- Date
- Author
- Status
- Discipline

**Relationships**:
- Belongs to: Capital Project
- Supports: Drawings
- Requires: Approvals
- Referenced by: Construction Documents

#### Construction Documents
**Purpose**: Documents for construction execution

**Key Fields**:
- Document ID
- Document Type (Contract Docs, Submittals, RFIs)
- Title
- Date
- Status
- Contractor

**Relationships**:
- Belongs to: Capital Project
- References: Drawings, Specifications
- Tracked by: Document Control
- Archived in: Project Files

#### Site Inspections
**Purpose**: On-site quality and progress checks

**Key Fields**:
- Inspection ID
- Inspection Date
- Inspector
- Inspection Type (Quality, Safety, Progress)
- Findings
- Photos
- Status

**Relationships**:
- Belongs to: Capital Project
- Generates: Punch List Items
- Identifies: Issues
- Documented in: Inspection Reports

#### Punch Lists
**Purpose**: List of items requiring completion/correction

**Key Fields**:
- Punch List ID
- Item Description
- Location
- Responsible Party
- Due Date
- Status (Open, In Progress, Completed)
- Priority

**Relationships**:
- Belongs to: Capital Project
- Generated by: Site Inspections
- Assigned to: Contractors
- Tracked until: Completion

---

### 9. RISK & COMPLIANCE OBJECTS

#### Risks
**Purpose**: Identified project risks

**Key Fields**:
- Risk ID
- Risk Description
- Risk Category (Budget, Schedule, Quality, Safety)
- Probability (Low, Medium, High)
- Impact (Low, Medium, High)
- Risk Score
- Status (Identified, Mitigated, Closed)

**Relationships**:
- Belongs to: Capital Project
- Has: Mitigation Plans
- Tracked by: Risk Agent
- Escalated via: Issues

#### Issues
**Purpose**: Active problems requiring resolution

**Key Fields**:
- Issue ID
- Issue Description
- Issue Type (Budget, Schedule, Quality, Safety)
- Severity (Low, Medium, High, Critical)
- Status (Open, In Progress, Resolved)
- Assigned To
- Resolution Date

**Relationships**:
- Belongs to: Capital Project
- May originate from: Risks
- Generates: Action Items
- Tracked by: Risk Agent

#### Mitigation Plans
**Purpose**: Strategies to address risks

**Key Fields**:
- Plan ID
- Risk ID
- Mitigation Strategy
- Responsible Party
- Implementation Date
- Cost
- Effectiveness

**Relationships**:
- Belongs to: Risk
- Assigned to: Project Team
- Tracked by: Risk Agent
- Evaluated for: Effectiveness

#### Compliance Checks
**Purpose**: Verification of regulatory compliance

**Key Fields**:
- Check ID
- Compliance Type (Environmental, Safety, Building Code)
- Check Date
- Checker
- Status (Compliant, Non-Compliant)
- Findings
- Corrective Actions

**Relationships**:
- Belongs to: Capital Project
- Identifies: Compliance Issues
- Generates: Corrective Actions
- Tracked by: Compliance Agent

#### Audit Findings
**Purpose**: Results of internal/external audits

**Key Fields**:
- Finding ID
- Audit Type
- Finding Description
- Severity
- Auditor
- Date
- Status (Open, Resolved)

**Relationships**:
- Belongs to: Capital Project
- Generates: Corrective Actions
- Tracked by: Compliance Agent
- Documented in: Audit Reports

#### Exception Requests
**Purpose**: Requests for policy/procedure exceptions

**Key Fields**:
- Request ID
- Exception Type
- Justification
- Requested By
- Request Date
- Approval Status
- Approved By
- Conditions

**Relationships**:
- Belongs to: Capital Project
- Requires: Approvals
- Tracked by: Governance Agent
- Documented in: Exception Log

---

## KNOWLEDGE GRAPH RELATIONSHIPS

### Primary Relationships

```
Capital Project
  ├─ HAS_BUDGET → Budget Header
  │   └─ CONTAINS → Budget Line Items
  │       └─ FUNDED_BY → Funding Sources
  │       └─ CATEGORIZED_BY → Cost Codes
  │
  ├─ HAS_CONTRACT → Contract
  │   ├─ AWARDED_TO → Vendor
  │   ├─ CONTAINS → Contract Line Items
  │   └─ GENERATES → Invoices
  │       └─ REQUIRES → Payment Approvals
  │
  ├─ HAS_PROCUREMENT → Purchase Requisition
  │   ├─ CONVERTS_TO → Purchase Order
  │   │   └─ GENERATES → Goods Receipt
  │   └─ PRECEDED_BY → RFI/RFP/RFQ
  │       └─ RECEIVES → Bid Responses
  │           └─ EVALUATED_BY → Vendor Evaluation
  │
  ├─ HAS_TASKS → Tasks
  │   ├─ DEPENDS_ON → Dependencies
  │   ├─ ASSIGNED_TO → Resources
  │   └─ TRACKED_BY → Milestones
  │
  ├─ HAS_MEETINGS → Meeting Records
  │   ├─ GENERATES → Meeting Minutes
  │   └─ CREATES → Action Items
  │
  ├─ HAS_RISKS → Risks
  │   └─ MITIGATED_BY → Mitigation Plans
  │
  ├─ HAS_DOCUMENTS → Drawings, Specifications
  │   └─ REQUIRES → Approvals
  │
  └─ GOVERNED_BY → Approval Templates, Phase Gates
      └─ REVIEWED_BY → Steering Committee
```

### Cross-Object Relationships

```
Budget Line Item
  ├─ CONSUMED_BY → Purchase Order
  ├─ CHARGED_BY → Invoice
  └─ TRACKED_BY → Cost Records

Purchase Order
  ├─ REFERENCES → Contract
  ├─ GENERATES → Invoice
  └─ CONFIRMED_BY → Goods Receipt

Invoice
  ├─ MATCHES_TO → Purchase Order
  ├─ REFERENCES → Contract
  └─ TRIGGERS → Payment Request

Task
  ├─ DEPENDS_ON → Other Tasks
  ├─ CONSUMES → Budget
  └─ GENERATES → Cost Records

Risk
  ├─ AFFECTS → Budget, Schedule, Quality
  ├─ ESCALATES_TO → Issue
  └─ REQUIRES → Mitigation Plan

Approval
  ├─ GATES → Project, Budget, Contract, Change
  ├─ FOLLOWS → Approval Template
  └─ TRACKED_IN → Audit Trail
```

---

## AGENT CAPABILITIES FOR KNOWLEDGE GRAPH

### Budget Agent
**Analyzes**: Budget → Funding → Cost Codes → Commitments → Forecasts

**Actions**:
- Create budget revisions
- Reallocate budget lines
- Request additional funding
- Trigger budget approvals
- Forecast cash flow
- Detect budget risks
- Recommend transfers

### Procurement Agent
**Analyzes**: PR → RFQ/RFP → Bids → Vendor Evaluation → PO → Goods Receipt

**Actions**:
- Generate RFQ/RFP
- Create requisitions
- Recommend vendors
- Create PO drafts
- Track deliveries
- Escalate delays
- Optimize procurement cycle

### Contract Agent
**Analyzes**: Contract → Amendments → Deliverables → Performance → Renewals

**Actions**:
- Draft contracts
- Detect expiring contracts
- Generate amendment requests
- Route approvals
- Track deliverables
- Evaluate performance
- Recommend renewals

### Finance Agent
**Analyzes**: Invoice → PO → Contract → Payment → Accruals → Commitments

**Actions**:
- Match invoices to PO lines
- Detect overbilling
- Recommend payment approvals
- Forecast cash flow
- Track commitments
- Manage accruals
- Identify discrepancies

### Schedule Agent
**Analyzes**: Tasks → Dependencies → Milestones → Resources → Critical Path

**Actions**:
- Create milestones
- Create task plans
- Detect dependency conflicts
- Suggest schedule recovery plans
- Optimize resource allocation
- Identify critical path
- Forecast completion

### Governance Agent
**Analyzes**: Approvals → Phase Gates → Meetings → Compliance → Audits

**Actions**:
- Generate approval packages
- Route approval workflows
- Escalate overdue approvals
- Generate executive summaries
- Track compliance
- Manage phase gates
- Document governance

### Risk Agent
**Analyzes**: Risks → Issues → Mitigation Plans → Compliance → Audits

**Actions**:
- Identify emerging risks
- Assess risk impact
- Recommend mitigation
- Escalate critical issues
- Track compliance
- Monitor audit findings
- Generate risk reports

---

## OSLC ENDPOINTS FOR ALL OBJECTS

### Project Governance
```
/oslc/so/cstCapitalProjectRS
/oslc/so/cstProjectChangeRequestRS
/oslc/so/cstProjectAmendmentRS
/oslc/so/cstProjectClosureRS
/oslc/so/cstPhaseGateReviewRS
/oslc/so/cstProjectApprovalTemplateRS
```

### Budget Management
```
/oslc/so/cstBudgetHeaderRS
/oslc/so/cstBudgetLineItemRS
/oslc/so/cstFundingSourceRS
/oslc/so/cstCostCodeRS
/oslc/so/cstBudgetTransferRS
/oslc/so/cstBudgetRevisionRS
/oslc/so/cstBudgetApprovalTemplateRS
```

### Procurement
```
/oslc/so/cstPurchaseRequisitionRS
/oslc/so/cstPRLineItemRS
/oslc/so/cstRFIRS
/oslc/so/cstRFPRS
/oslc/so/cstRFQRS
/oslc/so/cstBidResponseRS
/oslc/so/cstVendorEvaluationRS
/oslc/so/cstPurchaseOrderRS
/oslc/so/cstPOLineItemRS
/oslc/so/cstGoodsReceiptRS
```

### Contract Management
```
/oslc/so/cstContractRS
/oslc/so/cstContractLineItemRS
/oslc/so/cstContractAmendmentRS
/oslc/so/cstContractRenewalRS
/oslc/so/cstContractApprovalRS
/oslc/so/cstContractDeliverableRS
```

### Financials
```
/oslc/so/cstInvoiceRS
/oslc/so/cstInvoiceLineItemRS
/oslc/so/cstPaymentRequestRS
/oslc/so/cstPaymentApprovalRS
/oslc/so/cstAccrualRS
/oslc/so/cstCommitmentRS
/oslc/so/cstForecastRS
```

### Execution Management
```
/oslc/so/cstTaskRS
/oslc/so/cstTaskTemplateRS
/oslc/so/cstMilestoneRS
/oslc/so/cstWorkPackageRS
/oslc/so/cstDependencyRS
/oslc/so/cstScheduleRS
/oslc/so/cstResourceAssignmentRS
```

### Meetings & Governance
```
/oslc/so/cstMeetingRecordRS
/oslc/so/cstMeetingMinutesRS
/oslc/so/cstActionItemRS
/oslc/so/cstSteeringCommitteeReviewRS
/oslc/so/cstGovernanceReviewRS
/oslc/so/cstApprovalBoardRS
```

### Engineering & Construction
```
/oslc/so/cstDrawingRS
/oslc/so/cstDrawingRevisionRS
/oslc/so/cstDrawingApprovalRS
/oslc/so/cstEngineeringDocumentRS
/oslc/so/cstConstructionDocumentRS
/oslc/so/cstSiteInspectionRS
/oslc/so/cstPunchListRS
```

### Risk & Compliance
```
/oslc/so/cstRiskRS
/oslc/so/cstIssueRS
/oslc/so/cstMitigationPlanRS
/oslc/so/cstComplianceCheckRS
/oslc/so/cstAuditFindingRS
/oslc/so/cstExceptionRequestRS
```

### Supporting Objects
```
/oslc/so/cstVendorRS
/oslc/so/cstDocumentRS
/oslc/so/cstAttachmentRS
/oslc/so/cstApprovalRecordRS
/oslc/so/cstAuditHistoryRS
```

---

## IMPLEMENTATION ROADMAP

### Phase 1: Knowledge Graph Foundation (Months 1-3)
- [ ] Design graph database schema
- [ ] Implement core object models
- [ ] Build relationship mapping engine
- [ ] Create graph query interface
- [ ] Develop graph visualization

### Phase 2: Budget & Finance Integration (Months 4-6)
- [ ] Implement Budget Agent with graph awareness
- [ ] Integrate funding sources and cost codes
- [ ] Build budget transfer workflows
- [ ] Implement Finance Agent
- [ ] Create invoice matching engine

### Phase 3: Procurement & Contracts (Months 7-9)
- [ ] Implement Procurement Agent
- [ ] Build RFI/RFP/RFQ workflows
- [ ] Integrate vendor evaluation
- [ ] Implement Contract Agent
- [ ] Build contract lifecycle management

### Phase 4: Execution & Governance (Months 10-12)
- [ ] Implement Schedule Agent with dependencies
- [ ] Build task management with graph
- [ ] Implement Governance Agent
- [ ] Build approval workflow engine
- [ ] Create phase gate management

### Phase 5: Risk & Compliance (Months 13-15)
- [ ] Implement Risk Agent
- [ ] Build risk assessment engine
- [ ] Integrate compliance tracking
- [ ] Build audit management
- [ ] Create exception handling

### Phase 6: Advanced Intelligence (Months 16-18)
- [ ] Implement graph-based ML models
- [ ] Build predictive analytics
- [ ] Create autonomous decision engine
- [ ] Implement cross-project learning
- [ ] Build portfolio optimization

---

## SUCCESS METRICS

### Knowledge Graph Metrics
- **Graph Completeness**: % of objects with full relationships
- **Query Performance**: Average graph query response time
- **Relationship Accuracy**: % of correctly mapped relationships
- **Data Consistency**: % of validated cross-object references

### Agent Performance Metrics
- **Detection Accuracy**: % of correctly identified issues
- **Recommendation Quality**: % of accepted recommendations
- **Automation Rate**: % of actions executed autonomously
- **Time Savings**: Hours saved through automation

### Business Impact Metrics
- **Budget Variance**: Reduction in budget overruns
- **Schedule Performance**: Improvement in on-time delivery
- **Procurement Efficiency**: Reduction in procurement cycle time
- **Compliance Rate**: Improvement in compliance adherence
- **Risk Mitigation**: Reduction in risk materialization

---

**Architecture Status**: Knowledge Graph design complete, ready for implementation  
**Next Step**: Begin Phase 1 - Knowledge Graph Foundation  
**Critical Success Factor**: Build relationships first, objects second