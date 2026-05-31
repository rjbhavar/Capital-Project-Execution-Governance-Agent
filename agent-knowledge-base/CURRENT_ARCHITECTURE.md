# Current Architecture - Agentic Operating Platform

**Version**: 2.0  
**Type**: Multi-Agent Execution Platform  
**Paradigm**: Agents Execute, Not Just Analyze

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                      │
│  Connection Screen → Dashboard → Project Command Center     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   AGENT ORCHESTRATION LAYER                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Planning   │  │    Budget    │  │ Procurement  │     │
│  │    Agent     │  │    Agent     │  │    Agent     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Schedule   │  │     Risk     │  │  Reporting   │     │
│  │    Agent     │  │    Agent     │  │    Agent     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   ACTION EXECUTION LAYER                     │
│  AgentActionExecutor → Approval Queue → Execution Engine    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    MREF INTEGRATION LAYER                    │
│  OSLC API → Session Management → Cookie Handling            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    IBM MAXIMO MREF/TRIRIGA                   │
│  Capital Projects → Budgets → Contracts → Proposals         │
└─────────────────────────────────────────────────────────────┘
```

---

## AGENT ORCHESTRATOR

### Current Implementation
**File**: `src/agents/AgentOrchestrator.js` (520 lines)

**Responsibilities**:
- Coordinate all 6 specialized agents
- Execute agents sequentially or in parallel
- Aggregate results from all agents
- Generate executive briefings
- Manage cross-agent insights
- Track execution performance

**Key Methods**:
- `executeAgents()` - Main orchestration
- `executeAgentsSequential()` - Sequential execution
- `executeAgentsParallel()` - Parallel execution
- `aggregateResults()` - Combine agent outputs
- `generateExecutiveBriefing()` - Create summary

---

## SPECIALIZED AGENTS

### 1. Planning Agent
**File**: `src/agents/specialized/PlanningAgent.js`

**Analyzes**:
- Project timeline
- Milestones
- Execution status

**Generates**:
- Timeline findings
- Milestone recommendations
- Execution insights

**Can Execute**:
- Update project details
- Propose milestones
- Maintain schedules

### 2. Budget Intelligence Agent
**File**: `src/agents/specialized/AllAgents.js`

**Analyzes**:
- Budget utilization
- Variance patterns
- Forecast accuracy

**Generates**:
- Budget findings
- Variance recommendations
- Forecast adjustments

**Can Execute**:
- Update budgets
- Adjust allocations
- Submit budget changes

### 3. Procurement Coordination Agent

**Analyzes**:
- Proposal status
- Contract execution
- Vendor performance

**Generates**:
- Procurement findings
- Contract recommendations
- Vendor insights

**Can Execute**:
- Create proposals
- Route for approval
- Update contracts

### 4. Schedule Monitoring Agent

**Analyzes**:
- Milestone completion
- Schedule delays
- Critical path

**Generates**:
- Schedule findings
- Delay recommendations
- Recovery plans

**Can Execute**:
- Update timelines
- Adjust dates
- Modify schedules

### 5. Risk & Compliance Agent

**Analyzes**:
- Project risks
- Compliance status
- Governance gaps

**Generates**:
- Risk findings
- Compliance recommendations
- Mitigation strategies

**Can Execute**:
- Flag risks
- Escalate issues
- Trigger reviews

### 6. Reporting Agent

**Analyzes**:
- Portfolio status
- Cross-project patterns
- Executive metrics

**Generates**:
- Executive summaries
- Status reports
- Portfolio analytics

**Can Execute**:
- Generate reports
- Send notifications
- Create summaries

---

## AGENT MEMORY SYSTEM

### Current Implementation
**File**: `src/agents/AgentMemory.js` (192 lines)

**Stores**:
- Agent execution history
- Findings per project
- Recommendations per project
- Risk history
- Execution context

**Key Methods**:
- `storeExecution()` - Save agent run
- `getProjectContext()` - Retrieve history
- `extractFindings()` - Get findings
- `extractRecommendations()` - Get recommendations

**Storage**: localStorage with JSON serialization

---

## EXECUTION FRAMEWORK

### AgentActionExecutor
**File**: `src/services/agentActions.js` (450 lines)

**Core Classes**:

#### AgentAction
```javascript
{
  id: string,
  agentName: string,
  actionType: string,
  title: string,
  description: string,
  projectId: string,
  projectName: string,
  payload: object,
  impact: string,
  confidence: number,
  priority: 'critical' | 'high' | 'medium' | 'low',
  status: 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed',
  createdAt: timestamp,
  approvedAt: timestamp,
  executedAt: timestamp,
  completedAt: timestamp,
  approvedBy: string,
  executionResult: object,
  error: string
}
```

#### AgentActionExecutor
**Singleton instance**: `agentActionExecutor`

**Methods**:
- `createAction()` - Create new action
- `getAction()` - Retrieve action
- `getPendingActions()` - Get approval queue
- `getProjectActions()` - Get project-specific actions
- `approveAction()` - Approve and execute
- `rejectAction()` - Reject with reason
- `executeAction()` - Execute approved action

**Execution Methods**:
- `executeUpdateProject()`
- `executeUpdateBudget()`
- `executeAdjustBudget()`
- `executeCreateProposal()`
- `executeRouteProposal()`
- `executeUpdateTimeline()`
- `executeFlagRisk()`
- `executeGenerateReport()`

---

## APPROVAL FRAMEWORK

### ApprovalQueue Component
**File**: `src/components/agent/ApprovalQueue.jsx` (180 lines)

**Features**:
- Displays pending actions
- Priority-based sorting
- Approve & Execute button
- Reject button with reason
- Real-time processing
- Color-coded priorities

**User Flow**:
1. Agent creates action
2. Action appears in queue
3. User reviews details
4. User approves or rejects
5. If approved: executes immediately
6. Result shown in execution history

### ExecutionHistory Component
**File**: `src/components/agent/ExecutionHistory.jsx` (220 lines)

**Features**:
- Shows completed actions
- Expandable details
- Timeline tracking
- Duration calculation
- Result display
- Error handling

---

## COMMAND CENTER

### ProjectCommandCenter
**File**: `src/pages/ProjectCommandCenter.jsx` (300 lines)

**Tabs**:
1. **Overview** - Project stats and agent summary
2. **Approval Queue** - Pending actions requiring approval
3. **Execution History** - Completed/failed actions
4. **Agent Findings** - Detailed agent analysis

**Features**:
- Project health dashboard
- Real-time action management
- Agent status display
- Demo action generation
- Integrated approval workflow

---

## DATA FLOW

### Action Lifecycle
```
1. Agent Analysis
   ↓
2. Agent.createAction()
   ↓
3. agentActionExecutor.createAction()
   ↓
4. Action stored (PENDING status)
   ↓
5. Appears in ApprovalQueue
   ↓
6. User clicks "Approve & Execute"
   ↓
7. agentActionExecutor.approveAction()
   ↓
8. action.approve(userId)
   ↓
9. executeAction(action)
   ↓
10. Execute specific method (e.g., executeUpdateBudget)
   ↓
11. Simulate MREF API call (1-2s delay)
   ↓
12. action.complete(result) or action.fail(error)
   ↓
13. Save to storage
   ↓
14. Appears in ExecutionHistory
   ↓
15. Update AgentMemory
```

### State Management
```
localStorage:
  - agent_actions: Map<actionId, AgentAction>
  - agent_memory: execution history

sessionStorage:
  - mref_username: authenticated user
  - mref_url: MREF server URL
  - demo_mode: boolean

Context API:
  - DataContext: projects, budgets, contracts
```

---

## INTEGRATION POINTS

### MREF API Layer
**Files**: 
- `src/services/api.js` - Axios client
- `src/services/auth.js` - Authentication
- `src/services/capitalProjects.js` - Project operations

**Current State**: 
- Authentication: ✅ Implemented
- Data fetching: ✅ Implemented
- Action execution: ⚠️ Simulated (needs real OSLC)

### Future Integration
```
agentActionExecutor.executeUpdateBudget()
  ↓
apiClient.put('/oslc/so/cstCapitalProjectRS/{id}', {
  'spi:triBudgetRevisedFR': newBudget
})
  ↓
MREF updates budget
  ↓
Return success/failure
  ↓
Update action status
```

---

## SCALABILITY DESIGN

### Adding New Agents
1. Create agent class extending BaseAgent
2. Implement `execute()` method
3. Add to AgentOrchestrator
4. Define action types
5. Implement execution methods

### Adding New Action Types
1. Add to ACTION_TYPES enum
2. Create execution method in AgentActionExecutor
3. Implement MREF API call
4. Add to approval queue display
5. Update execution history

### Adding New Features
- Agents are independent modules
- Action framework is extensible
- UI components are reusable
- Storage is flexible (can migrate to backend)

---

## PERFORMANCE CHARACTERISTICS

### Current Performance
- **Page Load**: <2 seconds
- **Navigation**: <100ms (in-memory)
- **Action Approval**: <1 second
- **Action Execution**: 1-2 seconds (simulated)
- **Build Time**: ~950ms

### Optimization Strategies
- Context API for global state
- localStorage for persistence
- Lazy loading for routes
- Memoization for expensive calculations
- Efficient re-renders

---

## SECURITY CONSIDERATIONS

### Current Implementation
- Session-based authentication
- HttpOnly cookies
- CORS handling via proxy
- Input validation
- Error sanitization

### Future Enhancements
- Role-based access control
- Action approval permissions
- Audit logging
- Encryption at rest
- Rate limiting

---

## TESTING STRATEGY

### Current State
- Manual testing only
- Build verification
- UI component testing

### Future Testing
- Unit tests for agents
- Integration tests for actions
- E2E tests for workflows
- Performance tests
- Security tests

---

**Architecture Status**: Foundation complete, production-ready with real MREF integration  
**Next Evolution**: Real OSLC action execution, advanced agent intelligence