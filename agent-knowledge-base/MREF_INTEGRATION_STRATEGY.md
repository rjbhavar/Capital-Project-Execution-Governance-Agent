# MREF Integration Strategy - OSLC API Implementation

**Version**: 1.0  
**Target**: IBM Maximo Real Estate & Facilities (MREF/TRIRIGA)  
**Protocol**: OSLC (Open Services for Lifecycle Collaboration)

---

## INTEGRATION OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│              CAPITAL PROJECT AGENT PLATFORM                  │
│  React Frontend → Agent Actions → Approval Workflow         │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    OSLC API Layer
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    IBM MAXIMO MREF                           │
│  Capital Projects → Budgets → Contracts → Proposals         │
└─────────────────────────────────────────────────────────────┘
```

---

## AUTHENTICATION STRATEGY

### Current Implementation
**File**: `src/services/auth.js`

**Method**: Form-based authentication with session cookies

```javascript
async function signIn(baseUrl, username, password) {
  // 1. Call signon endpoint
  const response = await axios.post(
    `${baseUrl}/oslc/login`,
    { username, password },
    { withCredentials: true }
  );
  
  // 2. Store session cookie (HttpOnly)
  // 3. Store user info in sessionStorage
  // 4. Return success
}
```

**Session Management**:
- HttpOnly cookies for security
- Session timeout handling
- Automatic re-authentication
- Logout cleanup

**Files**:
- `src/services/auth.js` - Authentication logic
- `src/services/api.js` - Axios client with credentials
- `src/pages/ConnectionScreen.jsx` - Login UI

---

## OSLC ENDPOINTS

### Capital Projects

#### Get All Projects
```
GET /oslc/so/cstCapitalProjectRS
Accept: application/json
```

**Response**:
```json
{
  "rdfs:member": [
    {
      "rdf:about": "https://.../cstCapitalProjectRS/12345",
      "spi:triNameTX": "Building Renovation",
      "spi:triProjectStatusCL": "Active",
      "spi:triBudgetOriginalFR": 1000000,
      "spi:triBudgetRevisedFR": 1050000,
      "spi:triStartDateDA": "2026-01-01",
      "spi:triEndDateDA": "2026-12-31"
    }
  ]
}
```

#### Get Single Project
```
GET /oslc/so/cstCapitalProjectRS/{projectId}
Accept: application/json
```

#### Update Project
```
PUT /oslc/so/cstCapitalProjectRS/{projectId}
Content-Type: application/json

{
  "spi:triBudgetRevisedFR": 1100000,
  "spi:triChangeReasonTX": "Scope expansion approved"
}
```

**Updatable Fields**:
- `spi:triBudgetRevisedFR` - Revised budget
- `spi:triEndDateDA` - End date
- `spi:triProjectStatusCL` - Status
- `spi:triDescriptionTX` - Description
- `spi:triChangeReasonTX` - Change reason

---

### Budgets

#### Get Project Budgets
```
GET /oslc/so/cstCapitalProjectRS/{projectId}/budgets
Accept: application/json
```

#### Update Budget Line
```
PUT /oslc/so/cstBudgetLineRS/{budgetId}
Content-Type: application/json

{
  "spi:triAmountFR": 50000,
  "spi:triReasonTX": "Budget reallocation"
}
```

---

### Proposals

#### Get All Proposals
```
GET /oslc/so/cstProposalRS
Accept: application/json
```

#### Create Proposal
```
POST /oslc/so/cstProposalRS
Content-Type: application/json

{
  "spi:triNameTX": "HVAC System Upgrade",
  "spi:triProjectID": "12345",
  "spi:triAmountFR": 75000,
  "spi:triDescriptionTX": "Replace aging HVAC system",
  "spi:triVendorTX": "ACME HVAC Inc"
}
```

#### Route Proposal for Approval
```
PUT /oslc/so/cstProposalRS/{proposalId}
Content-Type: application/json

{
  "spi:triStatusCL": "Pending Approval",
  "spi:triApproverID": "manager123"
}
```

---

### Contracts

#### Get Project Contracts
```
GET /oslc/so/cstContractRS?projectId={projectId}
Accept: application/json
```

#### Update Contract
```
PUT /oslc/so/cstContractRS/{contractId}
Content-Type: application/json

{
  "spi:triAmountFR": 100000,
  "spi:triEndDateDA": "2027-06-30"
}
```

---

## ACTION EXECUTION MAPPING

### 1. UPDATE_PROJECT

**Agent Action**:
```javascript
{
  actionType: 'UPDATE_PROJECT',
  payload: {
    projectId: '12345',
    updates: {
      status: 'On Hold',
      reason: 'Awaiting permits'
    }
  }
}
```

**OSLC Call**:
```javascript
PUT /oslc/so/cstCapitalProjectRS/12345
{
  "spi:triProjectStatusCL": "On Hold",
  "spi:triChangeReasonTX": "Awaiting permits"
}
```

---

### 2. UPDATE_BUDGET

**Agent Action**:
```javascript
{
  actionType: 'UPDATE_BUDGET',
  payload: {
    projectId: '12345',
    newBudget: 1100000,
    reason: 'Material cost increase'
  }
}
```

**OSLC Call**:
```javascript
PUT /oslc/so/cstCapitalProjectRS/12345
{
  "spi:triBudgetRevisedFR": 1100000,
  "spi:triChangeReasonTX": "Material cost increase"
}
```

---

### 3. ADJUST_BUDGET

**Agent Action**:
```javascript
{
  actionType: 'ADJUST_BUDGET',
  payload: {
    budgetLineId: '67890',
    newAmount: 50000,
    reason: 'Reallocation from contingency'
  }
}
```

**OSLC Call**:
```javascript
PUT /oslc/so/cstBudgetLineRS/67890
{
  "spi:triAmountFR": 50000,
  "spi:triReasonTX": "Reallocation from contingency"
}
```

---

### 4. CREATE_PROPOSAL

**Agent Action**:
```javascript
{
  actionType: 'CREATE_PROPOSAL',
  payload: {
    projectId: '12345',
    title: 'Emergency Roof Repair',
    amount: 25000,
    vendor: 'QuickFix Roofing',
    description: 'Urgent leak repair'
  }
}
```

**OSLC Call**:
```javascript
POST /oslc/so/cstProposalRS
{
  "spi:triNameTX": "Emergency Roof Repair",
  "spi:triProjectID": "12345",
  "spi:triAmountFR": 25000,
  "spi:triVendorTX": "QuickFix Roofing",
  "spi:triDescriptionTX": "Urgent leak repair"
}
```

---

### 5. ROUTE_PROPOSAL

**Agent Action**:
```javascript
{
  actionType: 'ROUTE_PROPOSAL',
  payload: {
    proposalId: '11111',
    approver: 'manager@company.com',
    priority: 'high'
  }
}
```

**OSLC Call**:
```javascript
PUT /oslc/so/cstProposalRS/11111
{
  "spi:triStatusCL": "Pending Approval",
  "spi:triApproverID": "manager@company.com",
  "spi:triPriorityCL": "High"
}
```

---

### 6. UPDATE_TIMELINE

**Agent Action**:
```javascript
{
  actionType: 'UPDATE_TIMELINE',
  payload: {
    projectId: '12345',
    newEndDate: '2027-03-31',
    reason: 'Weather delays'
  }
}
```

**OSLC Call**:
```javascript
PUT /oslc/so/cstCapitalProjectRS/12345
{
  "spi:triEndDateDA": "2027-03-31",
  "spi:triChangeReasonTX": "Weather delays"
}
```

---

### 7. ADJUST_SCHEDULE

**Agent Action**:
```javascript
{
  actionType: 'ADJUST_SCHEDULE',
  payload: {
    milestoneId: '22222',
    newDate: '2026-08-15',
    reason: 'Dependency delay'
  }
}
```

**OSLC Call**:
```javascript
PUT /oslc/so/cstMilestoneRS/22222
{
  "spi:triTargetDateDA": "2026-08-15",
  "spi:triReasonTX": "Dependency delay"
}
```

---

### 8. FLAG_RISK

**Agent Action**:
```javascript
{
  actionType: 'FLAG_RISK',
  payload: {
    projectId: '12345',
    riskType: 'Budget Overrun',
    severity: 'High',
    description: 'Projected 15% over budget'
  }
}
```

**OSLC Call**:
```javascript
POST /oslc/so/cstRiskRS
{
  "spi:triProjectID": "12345",
  "spi:triRiskTypeCL": "Budget Overrun",
  "spi:triSeverityCL": "High",
  "spi:triDescriptionTX": "Projected 15% over budget"
}
```

---

### 9. ESCALATE_ISSUE

**Agent Action**:
```javascript
{
  actionType: 'ESCALATE_ISSUE',
  payload: {
    projectId: '12345',
    issueType: 'Schedule Delay',
    escalateTo: 'executive@company.com',
    description: 'Critical path delay'
  }
}
```

**OSLC Call**:
```javascript
POST /oslc/so/cstIssueRS
{
  "spi:triProjectID": "12345",
  "spi:triIssueTypeCL": "Schedule Delay",
  "spi:triAssignedToID": "executive@company.com",
  "spi:triPriorityCL": "Critical",
  "spi:triDescriptionTX": "Critical path delay"
}
```

---

### 10. GENERATE_REPORT

**Agent Action**:
```javascript
{
  actionType: 'GENERATE_REPORT',
  payload: {
    reportType: 'Executive Summary',
    projectIds: ['12345', '67890'],
    format: 'PDF'
  }
}
```

**Implementation**:
- Generate report in platform
- Store in MREF document management
- Send notification

---

## ERROR HANDLING

### OSLC Error Responses

#### 400 Bad Request
```json
{
  "oslc:Error": {
    "oslc:statusCode": "400",
    "oslc:message": "Invalid field value"
  }
}
```

**Handling**:
- Parse error message
- Show user-friendly message
- Log for debugging
- Mark action as failed

#### 401 Unauthorized
```json
{
  "oslc:Error": {
    "oslc:statusCode": "401",
    "oslc:message": "Session expired"
  }
}
```

**Handling**:
- Trigger re-authentication
- Retry action after login
- Notify user

#### 403 Forbidden
```json
{
  "oslc:Error": {
    "oslc:statusCode": "403",
    "oslc:message": "Insufficient permissions"
  }
}
```

**Handling**:
- Show permission error
- Suggest contacting admin
- Mark action as failed

#### 404 Not Found
```json
{
  "oslc:Error": {
    "oslc:statusCode": "404",
    "oslc:message": "Resource not found"
  }
}
```

**Handling**:
- Verify resource ID
- Refresh data
- Mark action as failed

#### 500 Internal Server Error
```json
{
  "oslc:Error": {
    "oslc:statusCode": "500",
    "oslc:message": "Internal server error"
  }
}
```

**Handling**:
- Retry with exponential backoff
- Log error details
- Notify support if persistent

---

## RETRY STRATEGY

### Exponential Backoff
```javascript
async function executeWithRetry(action, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await executeAction(action);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      await sleep(delay);
    }
  }
}
```

### Retry Conditions
- Network errors: Retry
- 500 errors: Retry
- 401 errors: Re-authenticate, then retry
- 400/403/404 errors: Don't retry

---

## TRANSACTION SAFETY

### Optimistic Locking
```javascript
// 1. Get current version
const project = await getProject(projectId);
const currentVersion = project['spi:triVersionNR'];

// 2. Update with version check
await updateProject(projectId, {
  ...updates,
  'spi:triVersionNR': currentVersion
});

// 3. If version mismatch, MREF returns 409 Conflict
```

### Rollback Strategy
```javascript
async function executeWithRollback(action) {
  // 1. Save current state
  const snapshot = await getCurrentState(action.projectId);
  
  try {
    // 2. Execute action
    const result = await executeAction(action);
    return result;
  } catch (error) {
    // 3. Rollback on failure
    await restoreState(action.projectId, snapshot);
    throw error;
  }
}
```

---

## PERFORMANCE OPTIMIZATION

### Batch Operations
```javascript
// Instead of multiple single updates
for (const project of projects) {
  await updateProject(project.id, updates);
}

// Use batch endpoint
await batchUpdateProjects(projects.map(p => ({
  id: p.id,
  updates: updates
})));
```

### Caching Strategy
```javascript
// Cache project data for 5 minutes
const cache = new Map();

async function getProject(projectId) {
  const cached = cache.get(projectId);
  if (cached && Date.now() - cached.timestamp < 300000) {
    return cached.data;
  }
  
  const data = await fetchProject(projectId);
  cache.set(projectId, { data, timestamp: Date.now() });
  return data;
}
```

### Pagination
```javascript
// For large datasets
async function getAllProjects() {
  let allProjects = [];
  let page = 1;
  const pageSize = 100;
  
  while (true) {
    const response = await getProjects(page, pageSize);
    allProjects.push(...response.projects);
    
    if (response.projects.length < pageSize) break;
    page++;
  }
  
  return allProjects;
}
```

---

## SECURITY CONSIDERATIONS

### Input Validation
```javascript
function validateActionPayload(action) {
  // Validate required fields
  if (!action.projectId) {
    throw new Error('Project ID required');
  }
  
  // Sanitize inputs
  action.payload = sanitizePayload(action.payload);
  
  // Validate data types
  if (action.payload.amount && typeof action.payload.amount !== 'number') {
    throw new Error('Amount must be a number');
  }
}
```

### CORS Configuration
```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/oslc': {
        target: process.env.VITE_MREF_URL,
        changeOrigin: true,
        secure: false,
        credentials: 'include'
      }
    }
  }
};
```

### Sensitive Data Handling
- Never log passwords
- Mask sensitive fields in logs
- Use HTTPS only
- Secure cookie storage

---

## TESTING STRATEGY

### Unit Tests
```javascript
describe('AgentActionExecutor', () => {
  it('should execute UPDATE_BUDGET action', async () => {
    const action = createAction('UPDATE_BUDGET', {
      projectId: '12345',
      newBudget: 1100000
    });
    
    const result = await executor.executeAction(action);
    
    expect(result.success).toBe(true);
    expect(result.updatedFields).toContain('triBudgetRevisedFR');
  });
});
```

### Integration Tests
```javascript
describe('MREF Integration', () => {
  it('should update project budget in MREF', async () => {
    // Create test project
    const project = await createTestProject();
    
    // Execute budget update
    const action = createBudgetUpdateAction(project.id, 1000000);
    await executor.executeAction(action);
    
    // Verify in MREF
    const updated = await getProject(project.id);
    expect(updated.budget).toBe(1000000);
    
    // Cleanup
    await deleteTestProject(project.id);
  });
});
```

### E2E Tests
```javascript
describe('Agent Workflow', () => {
  it('should complete full approval workflow', async () => {
    // 1. Agent creates action
    const action = await agent.analyze(project);
    
    // 2. Action appears in queue
    const queue = await getApprovalQueue();
    expect(queue).toContain(action);
    
    // 3. User approves
    await approveAction(action.id);
    
    // 4. Action executes
    await waitForExecution(action.id);
    
    // 5. Verify result
    const history = await getExecutionHistory();
    expect(history[0].status).toBe('completed');
  });
});
```

---

## MONITORING & LOGGING

### Action Logging
```javascript
function logAction(action, result) {
  console.log({
    timestamp: new Date().toISOString(),
    actionId: action.id,
    actionType: action.actionType,
    projectId: action.projectId,
    status: result.success ? 'success' : 'failure',
    duration: result.duration,
    error: result.error
  });
}
```

### Performance Monitoring
```javascript
function trackPerformance(action, startTime) {
  const duration = Date.now() - startTime;
  
  // Log slow operations
  if (duration > 5000) {
    console.warn(`Slow action: ${action.actionType} took ${duration}ms`);
  }
  
  // Track metrics
  metrics.recordActionDuration(action.actionType, duration);
}
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Basic Integration
- [ ] Implement real OSLC calls for UPDATE_PROJECT
- [ ] Implement real OSLC calls for UPDATE_BUDGET
- [ ] Add error handling
- [ ] Add retry logic
- [ ] Test with real MREF instance

### Phase 2: Full Action Support
- [ ] Implement all 12 action types
- [ ] Add transaction safety
- [ ] Add rollback mechanisms
- [ ] Comprehensive error handling

### Phase 3: Optimization
- [ ] Add caching
- [ ] Implement batch operations
- [ ] Add performance monitoring
- [ ] Optimize API calls

### Phase 4: Production Readiness
- [ ] Security audit
- [ ] Load testing
- [ ] Error recovery testing
- [ ] Documentation

---

**Integration Status**: Foundation ready, awaiting MREF access for real implementation  
**Next Step**: Replace simulated execution with real OSLC calls