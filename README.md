# Capital Project Management Platform

A comprehensive, production-ready platform for managing capital projects with AI-powered agents, workflow automation, and real-time analytics.

## 🎯 Overview

This platform provides end-to-end capital project management capabilities with autonomous agent orchestration, workflow automation, and comprehensive analytics. Built for enterprise scale with security, audit logging, and resilience patterns.

## ✨ Key Features

### 🤖 AI-Powered Agent Framework
- **30+ Specialized Agents** for comprehensive project analysis
- **Agent Orchestration** with sequential and parallel execution
- **Cross-Agent Insights** for holistic project understanding
- **Executive Briefings** automatically generated from agent findings

### 🔄 Workflow Automation
- **Configurable Workflows** for business process automation
- **Capital Project Lifecycle** fully automated from funding to closeout
- **Approval Workflows** with routing and escalation
- **Retry Logic** with exponential backoff and circuit breakers

### 🔐 Enterprise Security
- **Role-Based Access Control (RBAC)** with 8+ predefined roles
- **Row-Level Security** for data isolation
- **Organization Hierarchy** support
- **Data Entitlements** with permission inheritance
- **Comprehensive Audit Logging** for compliance

### 📊 Advanced Analytics
- **Portfolio Analytics** with health and risk distribution
- **Financial Analytics** with budget performance and forecasting
- **Procurement Analytics** with vendor performance tracking
- **Executive Analytics** with KPIs and strategic metrics

### 🔔 Multi-Channel Notifications
- **In-App Notifications** with real-time updates
- **Email/SMS/Push** support (configurable)
- **Alert Management** with severity levels
- **Notification History** and read tracking

### 🛡️ Resilience & Reliability
- **Retry Patterns** with exponential backoff
- **Circuit Breakers** for fault tolerance
- **Fallback Mechanisms** for graceful degradation
- **Timeout Handling** and bulkhead patterns
- **Saga Pattern** for distributed transactions

### 📡 Event-Driven Architecture
- **Event Bus** with pub/sub messaging
- **40+ Event Types** for system-wide communication
- **Event History** tracking
- **Filtered Subscriptions** for targeted notifications

## 🏗️ Architecture

### Core Services

```
src/services/
├── oslc.js                    # 18 OSLC service classes for MREF integration
├── EventBus.js                # Pub/sub messaging system
├── WorkflowEngine.js          # Workflow orchestration
├── SecurityService.js         # RBAC and data entitlements
├── NotificationService.js     # Multi-channel notifications
├── AuditService.js           # Comprehensive audit logging
├── ResilienceService.js      # Retry, circuit breaker, fallback
├── AnalyticsService.js       # Portfolio and financial analytics
├── ProjectDigitalTwin.js     # Digital twin framework
└── AgentOrchestratorService.js # Agent coordination
```

### Agent Framework

```
src/agents/
├── BaseAgent.js              # Abstract base class
├── AgentOrchestrator.js      # Agent coordination
├── AgentMemory.js            # Agent memory and context
└── specialized/
    ├── AllSpecializedAgents.js  # 30+ specialized agents
    └── PlanningAgent.js         # Example specialized agent
```

### Frontend Components

```
src/
├── pages/                    # Application pages
├── components/               # Reusable components
├── layouts/                  # Layout components
├── context/                  # React context providers
└── hooks/                    # Custom React hooks
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Access to MREF instance (for production)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd capital-project-coordinator

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development

The application will start on `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_MREF_BASE_URL=https://your-mref-instance.com
VITE_MREF_USERNAME=your-username
VITE_MREF_PASSWORD=your-password
```

### MREF Integration

To connect to real MREF endpoints:

1. **Update Service Configuration**
   ```javascript
   // In src/services/oslc.js
   this.useMock = false; // Change from true to false
   ```

2. **Configure Environment Variables**
   - Set `VITE_MREF_BASE_URL` to your MREF instance
   - Configure authentication credentials

3. **Test Connection**
   - Use the Connection Screen to verify connectivity
   - Check capability detection for available APIs

## 📚 Documentation

- [Complete Platform Implementation](./COMPLETE_PLATFORM_IMPLEMENTATION.md) - Comprehensive implementation details
- [Startup Guide](./STARTUP_GUIDE.md) - Quick start guide
- [API Integration](./API_INTEGRATION.md) - MREF API integration guide
- [Agent Knowledge Base](./agent-knowledge-base/) - Agent capabilities and architecture

## 🏢 Enterprise Features

### Security
- Multi-tenant support with organization hierarchy
- Role-based access control (RBAC)
- Row-level security (RLS)
- Data entitlements and permission inheritance
- Comprehensive audit trails

### Scalability
- Event-driven architecture
- Asynchronous processing
- Circuit breakers for fault tolerance
- Caching strategies
- Batch operations support

### Observability
- Comprehensive audit logging
- Event history tracking
- Agent execution monitoring
- Performance metrics
- Error tracking and reporting

### Compliance
- Complete audit trails
- Data access logging
- Change tracking
- Approval workflows
- Retention policies

## 🤝 Agent Capabilities

### Project Management Agents
- Capital Project Agent
- Planning Agent
- Schedule Agent
- Task Agent
- Milestone Agent

### Financial Agents
- Budget Intelligence Agent
- Funding Agent
- Cost Code Agent
- Forecasting Agent
- Payment Agent

### Procurement Agents
- Procurement Agent
- Vendor Agent
- RFQ Agent
- RFP Agent
- Contract Agent
- Purchase Order Agent
- Invoice Agent

### Risk & Compliance Agents
- Risk Agent
- Issue Agent
- Compliance Agent
- Audit Agent
- Change Management Agent

### Intelligence Agents
- Portfolio Intelligence Agent
- Executive Insights Agent
- Weather Intelligence Agent
- Document Intelligence Agent
- Executive Reporting Agent

### Operational Agents
- Approval Agent
- Notification Agent
- Workflow Agent
- Meeting Agent
- Closeout Agent

## 🔄 Workflow Examples

### Capital Project Lifecycle

```
Funding Approved
    ↓
Create Project
    ↓
Generate Cost Codes
    ↓
Create Budget
    ↓
Allocate Funding
    ↓
Generate Milestones
    ↓
Generate Tasks
    ↓
Create Procurement Packages
    ↓
Generate RFQ/RFP
    ↓
Vendor Recommendations
    ↓
Create Contracts
    ↓
Generate Purchase Orders
    ↓
Monitor Execution
    ↓
Project Closeout
```

### Invoice Approval Workflow

```
Receive Invoice
    ↓
Validate Invoice
    ↓
Match Purchase Order
    ↓
Approve Invoice
    ↓
Schedule Payment
```

## 📊 Analytics Capabilities

### Portfolio Analytics
- Project health distribution
- Risk distribution
- Budget utilization
- Status and phase analysis
- Regional analysis
- Type analysis

### Financial Analytics
- Budget performance tracking
- Cost trends and forecasting
- Variance analysis
- Cashflow projections
- Cost by category

### Procurement Analytics
- Contract summary
- Vendor performance
- Procurement timeline
- Cost savings analysis
- Compliance metrics

### Executive Analytics
- Key Performance Indicators (KPIs)
- Strategic metrics
- Risk summary
- Performance indicators
- Executive summaries

## 🛠️ Technology Stack

- **Frontend**: React 18, React Router, Tailwind CSS
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **State Management**: React Context
- **Architecture**: Event-driven, microservices-ready

## 📝 API Integration

### OSLC Services

The platform provides 18 OSLC service classes:

1. CapitalProjectService
2. BudgetService
3. FundingRequestService
4. ContractService
5. PurchaseOrderService
6. InvoiceService
7. PaymentService
8. RiskService
9. MeetingService
10. TaskService
11. ApprovalService
12. ChangeRequestService
13. VendorService
14. RFQService
15. RFPService
16. BidService
17. CostCodeService
18. MilestoneService

Each service provides:
- `create()` - Create new resource
- `read()` - Read resource by ID
- `update()` - Update resource
- `delete()` - Delete resource
- `query()` - Query resources with filters

## 🧪 Testing

### Run Tests (To Be Implemented)

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 🚢 Deployment

### Production Build

```bash
npm run build
```

### Deploy to Production

1. Build the application
2. Configure environment variables
3. Deploy `dist/` directory to your hosting service
4. Configure MREF connection
5. Test all integrations

## 📈 Monitoring

The platform includes built-in monitoring capabilities:

- Agent execution tracking
- Workflow instance monitoring
- Event history
- Audit logs
- Performance metrics
- Error tracking

## 🤝 Contributing

This is an enterprise platform. For contributions:

1. Follow the existing code structure
2. Maintain test coverage
3. Update documentation
4. Follow security best practices

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For support and questions:
- Check the documentation in `/agent-knowledge-base/`
- Review implementation details in `COMPLETE_PLATFORM_IMPLEMENTATION.md`
- Contact the development team

## 🎉 Acknowledgments

Built with modern enterprise architecture patterns and best practices for capital project management.

---

**Status**: Production-Ready (pending MREF endpoint configuration)

**Version**: 1.0.0

**Last Updated**: 2026-05-31