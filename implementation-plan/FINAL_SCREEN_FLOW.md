# Final Application Screen Flow

**Document Version**: 1.0  
**Date**: 2026-05-31  
**Purpose**: Define complete navigation and user experience flow  
**Status**: Design Complete

---

## EXECUTIVE SUMMARY

This document defines the complete screen flow for the **Capital Project Execution & Governance Agent**, transforming it from a dashboard-first application into a professional enterprise platform with proper connection management and agent-centric workflows.

**Key Changes**:
1. Add professional connection screen as entry point
2. Restructure navigation to emphasize agent capabilities
3. Add agent workbench for transparency
4. Improve information architecture

---

## APPLICATION ENTRY FLOW

### Current Flow (INCORRECT)
```
Browser Opens
    ↓
Dashboard (with background auth)
    ↓
Browser Authentication Popup (unprofessional)
    ↓
Dashboard Loads
```

**Problems**:
- No connection setup
- Browser popup unprofessional
- No environment selection
- No error visibility
- Assumes credentials configured

### New Flow (CORRECT)
```
Browser Opens
    ↓
Connection Screen
    ↓
User Enters Credentials
    ↓
System Validates Connection
    ↓
System Creates Session
    ↓
System Loads Initial Data
    ↓
Dashboard Overview
```

**Benefits**:
- Professional first impression
- Clear connection process
- Environment selection
- Error handling visible
- User control

---

## SCREEN HIERARCHY

### Level 0: Connection
```
Connection Screen (Entry Point)
```

### Level 1: Main Navigation
```
Dashboard Overview (Home)
├── Projects
├── Budgets
├── Procurement
├── Reports
└── Alerts
```

### Level 2: Detail Views
```
Projects
├── Project Intelligence Workspace
└── Agent Workbench

Dashboard
└── Executive Briefing

Reports
└── Report Builder
```

### Level 3: Modals & Overlays
```
Batch Analysis Modal
Project Analysis Modal
Export Options
Settings
User Profile
```

---

## DETAILED SCREEN SPECIFICATIONS

## SCREEN 1: CONNECTION SCREEN

### Purpose
Professional MREF connection interface - first screen users see

### Layout
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              [IBM MREF Logo/Branding]                   │
│                                                         │
│     Capital Project Execution & Governance Agent        │
│                                                         │
│              Powered by IBM Maximo                      │
│           Real Estate & Facilities (MREF)               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Connection Settings                                    │
│                                                         │
│  MREF Server URL *                                      │
│  ┌───────────────────────────────────────────────────┐ │
│  │ https://semas.facilities.semas.apps...           │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Username *                                             │
│  ┌───────────────────────────────────────────────────┐ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Password *                                             │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ••••••••••                                        │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Environment (Optional)                                 │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Production ▼                                      │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐             │
│  │ Test Connection │  │ Connect to MREF │             │
│  └─────────────────┘  └─────────────────┘             │
│                                                         │
│  [✓] Remember credentials (secure storage)             │
│                                                         │
│  Status: Ready to connect                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Components

**Header Section**
- Application logo/branding
- Application title: "Capital Project Execution & Governance Agent"
- Subtitle: "Powered by IBM Maximo Real Estate & Facilities (MREF)"

**Connection Form**
- **MREF Server URL** (required)
  - Text input
  - Placeholder: "https://your-mref-server.com"
  - Validation: Must be valid URL
  - Example shown below field

- **Username** (required)
  - Text input
  - Placeholder: "Enter your MREF username"
  - Validation: Required field

- **Password** (required)
  - Password input (masked)
  - Show/hide toggle icon
  - Validation: Required field

- **Environment** (optional)
  - Dropdown select
  - Options: Development, Test, Staging, Production
  - Default: Production
  - Purpose: Visual indicator, saved with connection

**Action Buttons**
- **Test Connection**
  - Secondary button
  - Tests connectivity without full login
  - Shows: "Testing..." → "Success" or "Failed"
  - Helps troubleshooting

- **Connect to MREF**
  - Primary button (prominent)
  - Validates inputs
  - Attempts authentication
  - Shows loading state
  - Navigates to dashboard on success

**Additional Features**
- Remember credentials checkbox (secure storage)
- Connection status indicator
- Error messages with troubleshooting tips
- Loading states during connection
- Success confirmation before navigation

### User Flows

**Happy Path**
1. User enters MREF URL
2. User enters username
3. User enters password
4. User selects environment (optional)
5. User clicks "Connect to MREF"
6. System validates inputs
7. System tests connection
8. System authenticates
9. System creates session
10. System loads initial data
11. System navigates to Dashboard
12. Success message shown

**Test Connection Flow**
1. User enters credentials
2. User clicks "Test Connection"
3. System tests connectivity
4. System shows result:
   - ✅ Success: "Connection successful"
   - ❌ Failed: "Cannot reach server" + troubleshooting

**Error Flows**

**Invalid URL**
- Show: "Please enter a valid MREF server URL"
- Highlight: URL field in red
- Example: "https://your-server.com"

**Missing Credentials**
- Show: "Username and password are required"
- Highlight: Empty fields

**Connection Failed**
- Show: "Cannot connect to MREF server"
- Troubleshooting:
  - "Check VPN connection"
  - "Verify server URL is correct"
  - "Contact IT support if issue persists"

**Authentication Failed**
- Show: "Invalid username or password"
- Action: Clear password field
- Allow retry

**Session Creation Failed**
- Show: "Connected but session creation failed"
- Troubleshooting:
  - "Try again"
  - "Check server status"
  - "Contact administrator"

### Technical Implementation

**Component**: `src/pages/ConnectionScreen.jsx`

**State Management**:
```javascript
const [formData, setFormData] = useState({
  serverUrl: '',
  username: '',
  password: '',
  environment: 'Production'
});
const [isConnecting, setIsConnecting] = useState(false);
const [isTesting, setIsTesting] = useState(false);
const [connectionStatus, setConnectionStatus] = useState('');
const [error, setError] = useState(null);
```

**Key Functions**:
- `handleTestConnection()` - Test connectivity
- `handleConnect()` - Full authentication flow
- `validateInputs()` - Form validation
- `handleError()` - Error display and troubleshooting

**Routing**:
```javascript
// App.jsx
<Routes>
  <Route path="/" element={<ConnectionScreen />} />
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  ...
</Routes>
```

---

## SCREEN 2: DASHBOARD OVERVIEW

### Purpose
Executive command center - portfolio-level view

### Layout
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Capital Project Governance    [User] [Settings] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Portfolio Overview                    Last Updated: Now│
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │   42     │ │  $125M   │ │   78%    │ │   85%    │  │
│  │ Projects │ │  Budget  │ │  Health  │ │ On Track │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│  Project Health Distribution                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Chart: Healthy/Warning/Critical distribution]  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Budget Performance                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Chart: Budget utilization across projects]     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Top Risks & Alerts                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • Project X: Budget overrun risk                │   │
│  │ • Project Y: Schedule delay detected            │   │
│  │ • Project Z: Compliance issue                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Quick Actions                                          │
│  [Run Portfolio Analysis] [Generate Executive Report]  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Navigation Bar (All Screens)
```
┌─────────────────────────────────────────────────────────┐
│ [☰] Capital Project Governance                          │
│                                                         │
│  📊 Dashboard                                           │
│  📁 Projects                                            │
│  💰 Budgets                                             │
│  📋 Procurement                                         │
│  📄 Reports                                             │
│  🔔 Alerts                                              │
│  🤖 Agent Workbench                                     │
│                                                         │
│  ─────────────────                                      │
│  ⚙️  Settings                                           │
│  👤 Profile                                             │
│  🚪 Disconnect                                          │
└─────────────────────────────────────────────────────────┘
```

### Key Features

**Portfolio KPIs**
- Total active projects
- Total budget allocated
- Average health score
- On-track percentage

**Visualizations**
- Health distribution chart
- Budget performance chart
- Schedule performance chart
- Risk heatmap

**Alerts Panel**
- Top 5 critical alerts
- Priority-based sorting
- Quick action buttons
- Link to full alerts page

**Quick Actions**
- Run portfolio analysis
- Generate executive report
- View agent briefing
- Export dashboard

---

## SCREEN 3: PROJECTS LIST

### Purpose
Operational workspace for project management

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  Projects                                               │
│                                                         │
│  [Search projects...]  [Filter ▼] [Export ▼]           │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Name          Status   Budget    Health  Actions│   │
│  ├─────────────────────────────────────────────────┤   │
│  │ HVAC Upgrade  Active   $2.5M     85%    [View]  │   │
│  │ Roof Repair   Warning  $500K     65%    [View]  │   │
│  │ Parking Lot   Critical $1.2M     45%    [View]  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Select All] [Batch Analysis] [Export Selected]       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Features

**Search & Filter**
- Full-text search
- Status filter (Active, Warning, Critical, etc.)
- Budget range filter
- Date range filter
- Health score filter
- Multi-select filters

**Project Table**
- Sortable columns
- Health score indicators
- Status badges
- Quick actions per row
- Batch selection

**Batch Operations**
- Select multiple projects
- Run batch analysis
- Export selected
- Generate report

**Actions**
- View project details
- Run AI analysis
- Export project data
- Generate report

---

## SCREEN 4: PROJECT INTELLIGENCE WORKSPACE

### Purpose
Deep dive into single project with AI analysis

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Projects                                     │
│                                                         │
│  HVAC Modernization Project                            │
│  Status: Active | Health: 85% | Budget: $2.5M          │
│                                                         │
│  [Tabs]                                                 │
│  Overview | Analysis | Budget | Schedule | Risks       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Executive Summary                               │   │
│  │ Project is performing well with minor risks... │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Health Score Breakdown (7 Factors)             │   │
│  │ Budget: 90% | Schedule: 85% | Risk: 75%        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ AI Recommendations                              │   │
│  │ • Review budget allocation for Phase 3         │   │
│  │ • Address schedule delay in Task 12            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Run Full Analysis] [Export Report] [View Agents]     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Sections (10 Total)

1. **Executive Summary**
   - AI-generated overview
   - Key metrics
   - Critical issues

2. **Health Score Breakdown**
   - 7-factor analysis
   - Visual indicators
   - Trend charts

3. **Budget Intelligence**
   - Utilization tracking
   - Variance analysis
   - Forecast

4. **Schedule Monitoring**
   - Milestone tracking
   - Delay detection
   - Critical path

5. **Risk Analysis**
   - Risk identification
   - Risk scoring
   - Mitigation strategies

6. **Recommendations**
   - AI-generated actions
   - Priority-based
   - Actionable items

7. **Stakeholder Analysis**
   - Key stakeholders
   - Engagement level
   - Communication needs

8. **Resource Tracking**
   - Team assignments
   - Resource utilization
   - Capacity planning

9. **Document Management**
   - Linked documents
   - Drawing access
   - Specification review

10. **Activity Timeline**
    - Recent updates
    - Change history
    - Audit trail

---

## SCREEN 5: AGENT WORKBENCH (NEW)

### Purpose
Transparency into agent operations - show agents working

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  Agent Workbench                                        │
│                                                         │
│  Active Analysis: HVAC Modernization Project           │
│                                                         │
│  Agent Status                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ✓ Planning Agent         Complete (2.3s)       │   │
│  │ ⟳ Budget Intelligence    Running...            │   │
│  │ ⏸ Procurement Agent      Waiting               │   │
│  │ ⏸ Schedule Monitor       Waiting               │   │
│  │ ⏸ Risk & Compliance      Waiting               │   │
│  │ ⏸ Reporting Agent        Waiting               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Agent Findings                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Planning Agent:                                 │   │
│  │ • Found 3 schedule risks                        │   │
│  │ • Identified 2 milestone delays                 │   │
│  │ • Generated 5 recommendations                   │   │
│  │                                                 │   │
│  │ Budget Intelligence Agent:                      │   │
│  │ • Analyzing budget utilization...               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Cross-Agent Insights                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • Schedule delay may impact budget              │   │
│  │ • Procurement delay affects timeline            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [View Full Report] [Export Analysis] [Run Again]      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Features

**Agent Status Panel**
- Real-time agent execution status
- Progress indicators
- Execution time tracking
- Success/failure indicators

**Agent Findings**
- Findings per agent
- Recommendations per agent
- Risks identified
- Insights generated

**Cross-Agent Insights**
- Collaborative findings
- Dependencies identified
- Holistic recommendations
- Portfolio-level insights

**Execution History**
- Previous analyses
- Performance metrics
- Trend analysis
- Comparison view

---

## SCREEN 6: BUDGETS

### Purpose
Financial governance and tracking

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  Budget Overview                                        │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  $125M   │ │  $98M    │ │   78%    │ │  $27M    │  │
│  │ Allocated│ │  Spent   │ │  Used    │ │ Remaining│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│  Budget Utilization by Project                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Chart: Budget utilization across projects]     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Variance Analysis                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Project          Budget    Actual    Variance   │   │
│  │ HVAC Upgrade     $2.5M     $2.1M     -16%      │   │
│  │ Roof Repair      $500K     $550K     +10%      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Export Budget Report] [Run Budget Analysis]          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## SCREEN 7: PROCUREMENT

### Purpose
Contract and vendor management

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  Procurement Pipeline                                   │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │    12    │ │    8     │ │    5     │ │    3     │  │
│  │ Proposals│ │ Contracts│ │ Pending  │ │ Overdue  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│  Active Contracts                                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Vendor       Project      Amount    Status      │   │
│  │ ABC Corp     HVAC         $1.2M     Active      │   │
│  │ XYZ Inc      Roof         $400K     Pending     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Export Procurement Report] [View Proposals]          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## SCREEN 8: REPORTS

### Purpose
Report generation and export

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  Reports & Analytics                                    │
│                                                         │
│  Report Templates                                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • Executive Summary Report                      │   │
│  │ • Project Status Report                         │   │
│  │ • Budget Performance Report                     │   │
│  │ • Risk Assessment Report                        │   │
│  │ • Portfolio Overview Report                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Custom Report Builder                                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Select Projects: [All ▼]                        │   │
│  │ Date Range: [Last 30 days ▼]                    │   │
│  │ Include: [☑] Budget [☑] Schedule [☑] Risks     │   │
│  │ Format: [Excel ▼]                               │   │
│  │ [Generate Report]                               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Recent Reports                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • Executive Summary - May 2026 [Download]       │   │
│  │ • Project Status - May 2026 [Download]          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## SCREEN 9: ALERTS

### Purpose
Real-time monitoring and notifications

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  Alerts & Notifications                                 │
│                                                         │
│  [All] [Critical] [High] [Medium] [Low]                │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🔴 CRITICAL: Budget overrun - HVAC Project      │   │
│  │    Project exceeds budget by 15%                │   │
│  │    2 hours ago | [View Details] [Acknowledge]  │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ 🟡 HIGH: Schedule delay - Roof Repair           │   │
│  │    Milestone delayed by 2 weeks                 │   │
│  │    5 hours ago | [View Details] [Acknowledge]  │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ 🟢 MEDIUM: Document pending - Parking Lot       │   │
│  │    Approval required for design documents       │   │
│  │    1 day ago | [View Details] [Acknowledge]    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Mark All as Read] [Export Alert History]             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## COMPLETE USER JOURNEY

### First-Time User Journey

**Step 1: Connection**
1. User opens application
2. Sees professional connection screen
3. Enters MREF URL, username, password
4. Selects environment (optional)
5. Clicks "Connect to MREF"
6. System validates and connects
7. Success message shown

**Step 2: Dashboard**
1. User lands on Dashboard Overview
2. Sees portfolio KPIs
3. Views health distribution
4. Checks top alerts
5. Explores quick actions

**Step 3: Project Exploration**
1. User clicks "Projects" in navigation
2. Sees list of all projects
3. Uses search/filter to find project
4. Clicks on project name

**Step 4: Project Intelligence**
1. User views Project Intelligence Workspace
2. Reads executive summary
3. Reviews health score breakdown
4. Checks AI recommendations
5. Explores 10 analysis sections

**Step 5: Agent Transparency**
1. User clicks "View Agents" button
2. Navigates to Agent Workbench
3. Sees agents working in real-time
4. Views agent findings
5. Understands cross-agent insights

**Step 6: Action**
1. User returns to project
2. Implements recommendations
3. Exports report for stakeholders
4. Checks alerts for updates

### Daily User Journey

**Morning Routine**
1. Open application (auto-login if remembered)
2. Check Dashboard for overnight alerts
3. Review portfolio health changes
4. Read executive briefing (if available)

**Project Management**
1. Navigate to Projects
2. Filter by "Needs Attention"
3. Review flagged projects
4. Run AI analysis on critical projects
5. Export status reports

**Afternoon Review**
1. Check Alerts page
2. Acknowledge critical alerts
3. Review budget performance
4. Check procurement status

**End of Day**
1. Generate executive summary
2. Export reports for stakeholders
3. Review agent insights
4. Plan next day actions

---

## NAVIGATION IMPROVEMENTS

### Current Navigation (Basic)
```
Dashboard
Projects
Budgets
Procurement
Reports
Alerts
```

### Proposed Navigation (Enhanced)
```
📊 Dashboard
   └─ Executive Briefing

📁 Projects
   ├─ All Projects
   ├─ Needs Attention
   └─ Recently Updated

💰 Budgets
   ├─ Budget Overview
   ├─ Variance Analysis
   └─ Forecast

📋 Procurement
   ├─ Contracts
   ├─ Proposals
   └─ Vendors

📄 Reports
   ├─ Templates
   ├─ Custom Builder
   └─ History

🔔 Alerts
   ├─ Critical
   ├─ All Alerts
   └─ History

🤖 Agent Workbench
   ├─ Active Analysis
   ├─ Agent Status
   └─ Execution History

⚙️ Settings
👤 Profile
🚪 Disconnect
```

---

## RESPONSIVE DESIGN CONSIDERATIONS

### Desktop (1920x1080)
- Full sidebar navigation
- Multi-column layouts
- Rich visualizations
- All features visible

### Tablet (1024x768)
- Collapsible sidebar
- Two-column layouts
- Simplified charts
- Touch-optimized

### Mobile (375x667)
- Bottom navigation
- Single-column layouts
- Essential features only
- Swipe gestures

---

## ACCESSIBILITY FEATURES

**Keyboard Navigation**
- Tab through all interactive elements
- Enter to activate buttons
- Escape to close modals
- Arrow keys for navigation

**Screen Reader Support**
- ARIA labels on all components
- Semantic HTML structure
- Alt text for images
- Descriptive link text

**Visual Accessibility**
- High contrast mode
- Adjustable font sizes
- Color-blind friendly palette
- Focus indicators

---

## PERFORMANCE TARGETS

**Page Load Times**
- Connection Screen: <1 second
- Dashboard: <2 seconds
- Project Details: <1.5 seconds
- Agent Workbench: <2 seconds

**Navigation**
- Tab switching: <100ms
- Search results: <500ms
- Filter application: <300ms

**Data Operations**
- Export: <3 seconds
- Report generation: <5 seconds
- Agent analysis: <10 seconds

---

## CONCLUSION

This screen flow transforms the application from a dashboard-first tool into a professional **Capital Project Execution & Governance Agent** with:

1. **Professional Entry**: Connection screen sets the right tone
2. **Agent Transparency**: Users see and understand agent value
3. **Clear Navigation**: Logical information architecture
4. **User-Centric**: Designed for daily workflows
5. **Scalable**: Room for future enhancements

**Next Steps**:
1. Review and validate this flow
2. Get user feedback
3. Begin implementation with Connection Screen
4. Build Agent Workbench UI
5. Iterate based on usage

---

**Document Status**: Complete  
**Ready for**: User review and validation  
**Implementation**: Awaiting approval