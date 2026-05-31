# MREF API Inventory

## Overview

This document catalogs all MREF/TRIRIGA OSLC APIs required for the Capital Project Execution & Governance Agent Platform.

**Last Updated:** 2026-05-31

---

## Current Implementation Status

### ✅ Implemented APIs

| Resource | Endpoint | Purpose | Status |
|----------|----------|---------|--------|
| Capital Projects | `/oslc/spq/cstCapitalProjectQC` | Retrieve all capital projects | ✅ Implemented |
| Budget (Embedded) | Via Capital Project query | Budget data embedded in project | ✅ Implemented |
| Proposal (Embedded) | Via Capital Project query | Proposal data embedded in project | ✅ Implemented |
| Contracts (Embedded) | Via Capital Project query | Contract data embedded in project | ✅ Implemented |
| Payments (Embedded) | Via Capital Project query | Payment data embedded in project | ✅ Implemented |

### 🔄 Partially Implemented

| Resource | Endpoint | Purpose | Status |
|----------|----------|---------|--------|
| Budget (Standalone) | `/oslc/spq/cstBudgetQC` | Direct budget queries | 🔄 Needs testing |
| Proposal (Standalone) | `/oslc/spq/cstProposalQC` | Direct proposal queries | 🔄 Needs testing |
| Contracts (Standalone) | `/oslc/spq/cstContractQC` | Direct contract queries | 🔄 Needs testing |
| Payments (Standalone) | `/oslc/spq/cstPaymentQC` | Direct payment queries | 🔄 Needs testing |

### ❌ Not Yet Implemented

| Resource | Endpoint | Purpose | Priority |
|----------|----------|---------|----------|
| Project Tasks | `/oslc/spq/cstProjectTaskQC` | Task management | High |
| Activities | `/oslc/spq/cstActivityQC` | Activity tracking | High |
| Milestones | `/oslc/spq/cstMilestoneQC` | Milestone tracking | High |
| Schedule | `/oslc/spq/cstScheduleQC` | Schedule management | High |
| Organizations | `/oslc/spq/triOrganizationQC` | Organization data | Medium |
| People | `/oslc/spq/triPeopleQC` | People/contacts | Medium |
| Documents | `/oslc/spq/triDocumentQC` | Document management | Medium |
| Locations | `/oslc/spq/triLocationQC` | Location data | Low |
| Assets | `/oslc/spq/triAssetQC` | Asset tracking | Low |
| Work Orders | `/oslc/spq/triWorkOrderQC` | Work order integration | Low |

---

## API Details

### 1. Capital Projects API

**Endpoint:** `/oslc/spq/cstCapitalProjectQC`

**Method:** GET

**Query Parameters:**
- `oslc.select` - Field selection (supports nested queries)
- `oslc.where` - Filter criteria
- `oslc.pageSize` - Results per page
- `oslc.orderBy` - Sort order

**Example Query:**
```
GET /oslc/spq/cstCapitalProjectQC?oslc.select=*,spi:cstBudget{*},spi:cstProposal{*},spi:cstContracts{*},spi:cstPayment{*}
```

**Key Fields:**
- `dcterms:identifier` - Unique ID
- `spi:triIdTX` - Project ID
- `spi:triNameTX` - Project name
- `spi:triStatusCL` - Status
- `spi:triPhaseCL` - Phase
- `spi:triBudgetOriginalRollupFR` - Budget amount
- `spi:triIncurredInvoiceRollupFR` - Invoiced amount
- `spi:triIncurredPaidRollupFR` - Paid amount
- `spi:triProjectPlanStartDA` - Start date
- `spi:triProjectPlanEndDA` - End date
- `spi:triProjectLeadTX` - Project manager
- `spi:triCityTX` - City
- `spi:triStateProvTX` - State
- `spi:triCountryTX` - Country

**Embedded Resources:**
- `spi:cstBudget` - Budget details
- `spi:cstProposal` - Proposal details
- `spi:cstContracts` - Contract details (array)
- `spi:cstPayment` - Payment details (array)

---

### 2. Budget API

**Endpoint:** `/oslc/spq/cstBudgetQC`

**Method:** GET

**Key Fields:**
- `dcterms:identifier` - Budget ID
- `spi:triNameTX` - Budget name
- `spi:triStatusCL` - Status
- `spi:triBudgetTypeCL` - Budget type
- `spi:triEstimatedCostFR` - Estimated cost
- `spi:triBudgetAmountFR` - Budget amount
- `spi:triIncurredCostFR` - Incurred cost
- `spi:triForecastCostFR` - Forecast cost
- `spi:triCurrencyUO` - Currency

**Use Cases:**
- Budget variance analysis
- Cost forecasting
- Budget approval workflows

---

### 3. Proposal API

**Endpoint:** `/oslc/spq/cstProposalQC`

**Method:** GET

**Key Fields:**
- `dcterms:identifier` - Proposal ID
- `spi:triNameTX` - Proposal name
- `spi:triStatusCL` - Status
- `spi:triProposalTypeCL` - Proposal type
- `spi:triContactNameTX` - Contact name
- `spi:triContactEmailTX` - Contact email
- `spi:triProposalDateDA` - Proposal date
- `spi:triBidAmountFR` - Bid amount

**Use Cases:**
- Proposal tracking
- Vendor management
- Bid analysis

---

### 4. Contract API

**Endpoint:** `/oslc/spq/cstContractQC`

**Method:** GET

**Key Fields:**
- `dcterms:identifier` - Contract ID
- `spi:triNameTX` - Contract name
- `spi:triStatusCL` - Status
- `spi:triContractTypeCL` - Contract type
- `spi:triApprovedAmountFR` - Approved amount
- `spi:triChangeOrdersFR` - Change orders
- `spi:triContractStateCL` - Contract state

**Use Cases:**
- Contract management
- Change order tracking
- Vendor performance

---

### 5. Payment API

**Endpoint:** `/oslc/spq/cstPaymentQC`

**Method:** GET

**Key Fields:**
- `dcterms:identifier` - Payment ID
- `spi:triNameTX` - Payment name
- `spi:triStatusCL` - Status
- `spi:triInvoiceAmountFR` - Invoice amount
- `spi:triPayeeTX` - Payee
- `spi:triPaymentDateDA` - Payment date

**Use Cases:**
- Payment tracking
- Invoice management
- Cash flow analysis

---

## Workflow Actions

### Available Actions

| Action | Endpoint Pattern | Purpose |
|--------|-----------------|---------|
| Approve | `/oslc/actions/{recordId}/approve` | Approve record |
| Reject | `/oslc/actions/{recordId}/reject` | Reject record |
| Submit | `/oslc/actions/{recordId}/submit` | Submit for approval |
| Revise | `/oslc/actions/{recordId}/revise` | Revise record |
| Close | `/oslc/actions/{recordId}/close` | Close record |

**Note:** Actual action endpoints may vary by MREF instance configuration.

---

## Missing APIs - Implementation Priority

### High Priority (Sprint 3)

1. **Project Tasks API**
   - Endpoint: `/oslc/spq/cstProjectTaskQC`
   - Purpose: Task management and tracking
   - Agent Impact: Schedule Agent, Planning Agent

2. **Activities API**
   - Endpoint: `/oslc/spq/cstActivityQC`
   - Purpose: Activity tracking and reporting
   - Agent Impact: Reporting Agent, Schedule Agent

3. **Milestones API**
   - Endpoint: `/oslc/spq/cstMilestoneQC`
   - Purpose: Milestone tracking
   - Agent Impact: Schedule Agent, Planning Agent

4. **Schedule API**
   - Endpoint: `/oslc/spq/cstScheduleQC`
   - Purpose: Schedule management
   - Agent Impact: Schedule Agent

### Medium Priority (Sprint 4)

5. **Organizations API**
   - Endpoint: `/oslc/spq/triOrganizationQC`
   - Purpose: Organization hierarchy and data
   - Agent Impact: Procurement Agent, Reporting Agent

6. **People API**
   - Endpoint: `/oslc/spq/triPeopleQC`
   - Purpose: Contact management
   - Agent Impact: All agents (for notifications)

7. **Documents API**
   - Endpoint: `/oslc/spq/triDocumentQC`
   - Purpose: Document management
   - Agent Impact: Risk Agent, Reporting Agent

### Low Priority (Future)

8. **Locations API**
9. **Assets API**
10. **Work Orders API**

---

## Authentication

All APIs require authentication via MREF session:

1. **Login:** `POST /p/websignon/signon`
   - Body: `{ userName, password }`
   - Returns: JSESSIONID cookie

2. **Session Management:**
   - Include JSESSIONID in all subsequent requests
   - Session timeout: Varies by instance (typically 30-60 minutes)
   - Handle 401 responses by re-authenticating

---

## OSLC Query Syntax

### Select Clause
```
oslc.select=field1,field2,nestedResource{*}
```

### Where Clause
```
oslc.where=spi:triStatusCL="Active"
```

### Pagination
```
oslc.pageSize=100
```

### Sorting
```
oslc.orderBy=+spi:triNameTX
```

---

## Implementation Notes

### Current Architecture

1. **MREFConnector** - Low-level HTTP client
2. **MCPLayer** - High-level data access layer
3. **Agents** - Consume MCP Layer (never direct API calls)

### Adding New APIs

To add a new API:

1. Add endpoint to `InstanceMetadataService.js`
2. Add parser method to `MCPLayer.js`
3. Add getter method to `MCPLayer.js`
4. Update agents to use new MCP method
5. Update this inventory

### Testing

Each API should be tested against actual MREF instance:
- Connectivity
- Authentication
- Data retrieval
- Error handling
- Performance

---

## Instance Discovery

The platform performs automatic discovery on connection:

1. Test Service Provider Catalog
2. Test each resource endpoint
3. Store available resources in metadata
4. Agents adapt based on available resources

---

## Error Handling

Standard error responses:

- `401` - Unauthorized (session expired)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Server Error (MREF internal error)

All errors are handled by MREFConnector and propagated to MCP Layer.

---

## Performance Considerations

1. **Caching:** MCP Layer caches data for 5 minutes
2. **Batch Queries:** Use embedded resources when possible
3. **Pagination:** Use appropriate page sizes
4. **Selective Fields:** Only request needed fields

---

## Security

1. **Credentials:** Never stored in code or logs
2. **Session:** Managed securely in memory
3. **HTTPS:** Always use HTTPS in production
4. **Permissions:** Respect MREF role-based access

---

## Next Steps

1. Implement high-priority missing APIs
2. Test all APIs against production MREF instance
3. Document instance-specific variations
4. Create API integration tests
5. Monitor API performance and reliability

---

**Document Owner:** Agent Platform Team  
**Review Cycle:** Monthly  
**Last Review:** 2026-05-31
