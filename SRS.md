# Aqua Billing Management System (ABMS)

# Software Requirements Specification (SRS)

**Version:** 1.0  
**Date:** June 2026  
**Prepared By:** Sai Chandra Kiran Uppalapati  
**Project Type:** Web Application  
**Domain:** Aqua Agriculture / Aquaculture Management

---

# Document Control

| Version | Date | Author | Description |
|----------|----------|----------|----------|
| 1.0 | June 2026 | Sai Chandra Kiran Uppalapati | Initial Release |

---

# 1. Introduction

## 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non-functional requirements for the Aqua Billing Management System (ABMS).

The purpose of the system is to provide aqua farm owners and managers with a centralized platform for managing medicine expenses, tracking billing records, generating reports, visualizing spending trends, and collaborating with multiple users.

---

## 1.2 Scope

The Aqua Billing Management System will provide:

- User Authentication
- Billing Management
- Expense Analytics
- Real-Time Collaboration
- Public Sharing Links
- Role-Based Access Control
- Report Generation
- Export Functionality

The application will be accessible from desktop, tablet, and mobile devices.

---

## 1.3 Intended Audience

This document is intended for:

- Product Owners
- Developers
- UI/UX Designers
- QA Engineers
- DevOps Engineers
- Project Managers

---

## 1.4 Definitions

| Term | Meaning |
|--------|---------|
| ABMS | Aqua Billing Management System |
| RLS | Row Level Security |
| JWT | JSON Web Token |
| CRUD | Create Read Update Delete |
| Workspace | Shared environment for farm management |
| Owner | User with full permissions |
| Editor | User with edit permissions |
| Viewer | User with read-only permissions |

---

# 2. Overall Description

## 2.1 Product Perspective

ABMS is a cloud-based SaaS application.

The system architecture consists of:

```text
Frontend (React + Vite)
            │
            ▼
       Supabase
 ┌───────────────────┐
 │ Authentication    │
 │ PostgreSQL DB     │
 │ Realtime Engine   │
 │ Storage           │
 └───────────────────┘
```

---

## 2.2 Product Functions

The system shall:

- Manage users
- Manage billing records
- Generate analytics
- Create reports
- Share dashboards
- Support collaboration
- Provide real-time updates

---

## 2.3 User Classes

### Farm Owner

Responsibilities:

- Monitor expenses
- Manage users
- View reports

Access Level:

- Full Access

---

### Farm Manager

Responsibilities:

- Add bills
- Edit records

Access Level:

- Limited Access

---

### Accountant

Responsibilities:

- View reports
- Export reports

Access Level:

- Read Access

---

### Public User

Responsibilities:

- View shared reports

Access Level:

- Public Read Access

---

## 2.4 Operating Environment

### Supported Browsers

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari

### Supported Devices

- Desktop
- Laptop
- Tablet
- Mobile Phone

---

# 3. System Features

# 3.1 Authentication Module

## Description

Allows users to securely access the system.

---

## Functional Requirements

### FR-AUTH-001

User shall be able to register using email and password.

---

### FR-AUTH-002

User shall be able to login.

---

### FR-AUTH-003

User shall be able to logout.

---

### FR-AUTH-004

User shall be able to reset password.

---

### FR-AUTH-005

User shall be able to login using Google.

---

## Priority

High

---

# 3.2 Dashboard Module

## Description

Provides overview of expenses and activities.

---

## Functional Requirements

### FR-DASH-001

System shall display total bills.

---

### FR-DASH-002

System shall display total expenses.

---

### FR-DASH-003

System shall display total discounts.

---

### FR-DASH-004

System shall display monthly spending.

---

### FR-DASH-005

System shall display recent transactions.

---

## Dashboard Widgets

### Statistics Cards

- Total Bills
- Total Expenses
- Total Discount Saved
- Monthly Expenses

### Analytics Graphs

- Daily Expense Trend
- Weekly Expense Trend
- Monthly Expense Trend
- Medicine Spending Distribution

---

# 3.3 Billing Management Module

## Description

Allows users to manage medicine purchase records.

---

## Data Fields

| Field | Type | Required |
|---------|---------|---------|
| Medicine Name | Text | Yes |
| MRP | Decimal | Yes |
| Discount | Decimal | Yes |
| Final Price | Decimal | Auto |
| Date | Date | Yes |
| Remarks | Text | No |

---

## Functional Requirements

### FR-BILL-001

User shall be able to create bills.

---

### FR-BILL-002

User shall be able to view bills.

---

### FR-BILL-003

User shall be able to edit bills.

---

### FR-BILL-004

User shall be able to delete bills.

---

### FR-BILL-005

System shall automatically calculate final price.

Formula:

```text
Final Price = MRP - (MRP × Discount ÷ 100)
```

---

## Priority

High

---

# 3.4 Search and Filter Module

## Description

Allows efficient data retrieval.

---

## Functional Requirements

### FR-SEARCH-001

Search by medicine name.

---

### FR-SEARCH-002

Search by remarks.

---

### FR-SEARCH-003

Filter by date range.

---

### FR-SEARCH-004

Filter by month.

---

### FR-SEARCH-005

Filter by amount range.

---

## Priority

Medium

---

# 3.5 Analytics Module

## Description

Provides insights into expenses.

---

## Functional Requirements

### FR-ANALYTICS-001

Display daily expense graph.

---

### FR-ANALYTICS-002

Display weekly expense graph.

---

### FR-ANALYTICS-003

Display monthly expense graph.

---

### FR-ANALYTICS-004

Display medicine-wise spending graph.

---

### FR-ANALYTICS-005

Automatically update graphs when new data is added.

---

## Priority

High

---

# 3.6 Reporting Module

## Description

Generate downloadable reports.

---

## Functional Requirements

### FR-REPORT-001

Generate daily reports.

---

### FR-REPORT-002

Generate weekly reports.

---

### FR-REPORT-003

Generate monthly reports.

---

### FR-REPORT-004

Generate yearly reports.

---

### FR-REPORT-005

Export reports as PDF.

---

### FR-REPORT-006

Export reports as Excel.

---

## Priority

Medium

---

# 3.7 Sharing Module

## Description

Allows report sharing and collaboration.

---

## Functional Requirements

### FR-SHARE-001

Generate public share links.

---

### FR-SHARE-002

Generate editor share links.

---

### FR-SHARE-003

Allow view-only access.

---

### FR-SHARE-004

Allow editor access.

---

### FR-SHARE-005

Allow link revocation.

---

## Priority

High

---

# 3.8 Role-Based Access Control

## Roles

### Owner

Permissions:

- Create
- Read
- Update
- Delete
- Manage Users
- Share Data

---

### Editor

Permissions:

- Create
- Read
- Update

---

### Viewer

Permissions:

- Read Only

---

## Functional Requirements

### FR-RBAC-001

System shall enforce role-based permissions.

---

### FR-RBAC-002

System shall prevent unauthorized actions.

---

### FR-RBAC-003

Owner shall manage user roles.

---

## Priority

High

---

# 3.9 Realtime Collaboration Module

## Description

Synchronizes data between connected users.

---

## Functional Requirements

### FR-REALTIME-001

Display new bills instantly.

---

### FR-REALTIME-002

Update dashboards automatically.

---

### FR-REALTIME-003

Synchronize edits in real time.

---

### FR-REALTIME-004

Notify users of updates.

---

## Priority

High

---

# 4. External Interface Requirements

## 4.1 User Interface

The application shall contain:

### Pages

- Login Page
- Dashboard
- Bills Page
- Reports Page
- Sharing Page
- Settings Page

---

## 4.2 Software Interfaces

### Supabase

Used for:

- Authentication
- Database
- Realtime
- Storage

---

## Frontend Libraries

### UI

- Tailwind CSS
- ShadCN UI

### Charts

- Recharts

### State Management

- Zustand

### Data Fetching

- TanStack Query

---

# 5. Database Requirements

# Table: profiles

```sql
id UUID PRIMARY KEY
email TEXT
full_name TEXT
created_at TIMESTAMP
```

---

# Table: workspaces

```sql
id UUID PRIMARY KEY
name TEXT
owner_id UUID
created_at TIMESTAMP
```

---

# Table: bills

```sql
id UUID PRIMARY KEY
workspace_id UUID
medicine_name TEXT
mrp NUMERIC
discount NUMERIC
final_price NUMERIC
date DATE
remarks TEXT
created_by UUID
created_at TIMESTAMP
```

---

# Table: workspace_members

```sql
id UUID PRIMARY KEY
workspace_id UUID
user_id UUID
role TEXT
created_at TIMESTAMP
```

---

# Table: share_links

```sql
id UUID PRIMARY KEY
workspace_id UUID
share_token TEXT
access_type TEXT
created_at TIMESTAMP
```

---

# 6. Non-Functional Requirements

## 6.1 Performance

Dashboard load time:

```text
≤ 2 seconds
```

Search response:

```text
≤ 1 second
```

Report generation:

```text
≤ 5 seconds
```

---

## 6.2 Security

### Requirements

- JWT Authentication
- HTTPS Encryption
- Password Hashing
- Row Level Security (RLS)
- Protected APIs

---

## 6.3 Scalability

System shall support:

- 10,000+ Bills
- 100+ Concurrent Users
- Multiple Workspaces

---

## 6.4 Availability

Target uptime:

```text
99.9%
```

---

## 6.5 Reliability

- Automatic Backups
- Data Recovery Support
- Realtime Synchronization

---

## 6.6 Maintainability

Codebase shall follow:

- Modular Architecture
- TypeScript Standards
- Reusable Components
- Documentation Standards

---

# 7. System Constraints

### Technology Constraints

Frontend:

- React
- Vite
- TypeScript

Backend Services:

- Supabase

Database:

- PostgreSQL

Hosting:

- Vercel

---

# 8. Acceptance Criteria

The system shall be accepted when:

- Authentication works correctly.
- Dashboard displays analytics.
- Bills can be created and edited.
- Search and filtering work.
- Reports can be exported.
- Sharing links function properly.
- Realtime updates work.
- Mobile responsiveness is verified.
- Role permissions are enforced.
- Supabase integration is fully operational.

---

# 9. Future Enhancements

## Version 2.0

- Medicine Inventory Management
- Stock Alerts
- Supplier Management
- Feed Expense Tracking
- Labor Expense Tracking
- Electricity Expense Tracking

---

## Version 3.0

- Mobile Application
- Offline Mode
- AI Expense Forecasting
- Advanced Analytics
- Multi-Farm Management

---

# End of Software Requirements Specification (SRS)