# Aqua Billing Management System (ABMS)

## Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** June 2026  
**Product Owner:** Sai Chandra Kiran Uppalapati  
**Product Type:** Web Application (SaaS)  
**Industry:** Aqua Agriculture / Aquaculture Management

---

# 1. Executive Summary

The Aqua Billing Management System (ABMS) is a cloud-based web application designed to help aqua farmers and farm managers efficiently track daily medicine purchases, monitor expenses, analyze spending trends, and collaborate with team members.

The system will provide a centralized platform for recording medicine bills, generating reports, visualizing expense data through graphs, and sharing data with collaborators through secure links.

The platform will use Supabase for authentication, database management, and real-time synchronization.

---

# 2. Problem Statement

Many aqua farms currently manage medicine expenses using notebooks, spreadsheets, or WhatsApp messages, resulting in:

- Inaccurate records
- Difficulty tracking expenses
- Lack of centralized data
- No real-time collaboration
- No analytics or insights
- Time-consuming report generation

Aqua farm owners need a simple and reliable system to manage and monitor daily medicine expenses.

---

# 3. Product Vision

To become a modern expense management platform for aqua farms that enables transparent tracking, real-time collaboration, and data-driven decision making.

---

# 4. Goals and Objectives

## Primary Goals

- Digitize daily medicine billing records.
- Reduce manual bookkeeping.
- Provide real-time expense tracking.
- Enable collaborative management.
- Generate visual insights through dashboards.

## Secondary Goals

- Export reports.
- Share expense data publicly.
- Monitor spending trends.
- Improve operational efficiency.

---

# 5. Target Users

## Farm Owner

Responsible for:

- Monitoring expenses
- Reviewing reports
- Managing users

### Permissions

- Full access
- User management
- Delete records
- Share workspaces

---

## Farm Manager

Responsible for:

- Adding bills
- Updating records
- Monitoring expenses

### Permissions

- Create records
- Update records
- View reports

---

## Accountant

Responsible for:

- Reviewing expenses
- Generating reports

### Permissions

- View reports
- Export reports

---

## Public Viewer

Responsible for:

- Viewing shared reports

### Permissions

- Read-only access

---

# 6. User Stories

## Authentication

As a user, I want to sign up and log in securely so that I can access my farm data.

---

## Billing

As a farm manager, I want to add daily medicine purchases so that all expenses are tracked.

---

## Analytics

As a farm owner, I want to view graphs and trends so that I can understand spending patterns.

---

## Collaboration

As a farm owner, I want to invite team members so that multiple people can manage records.

---

## Sharing

As a farm owner, I want to generate public links so that others can view reports.

---

## Reporting

As an accountant, I want to export reports so that financial records can be maintained.

---

# 7. Core Features

## 7.1 Authentication

### Description

User authentication and account management.

### Features

- Email Signup
- Email Login
- Google Login
- Password Reset
- Logout

### Technology

- Supabase Auth

---

## 7.2 Dashboard

### Description

The landing page after login.

### Dashboard Cards

- Total Bills
- Total Expenses
- Total Discount Saved
- Monthly Expenses
- Today's Expenses

### Widgets

- Expense Trend Graph
- Recent Bills
- Monthly Summary

---

## 7.3 Billing Management

### Description

Create and manage medicine purchase records.

### Required Fields

| Field | Type | Required |
|---------|---------|---------|
| Medicine Name | Text | Yes |
| MRP | Number | Yes |
| Discount | Number | Yes |
| Final Price | Number | Auto |
| Date | Date | Yes |
| Remarks | Text | No |

---

### Formula

Final Price = MRP - (MRP × Discount ÷ 100)

---

### Operations

- Add Bill
- Edit Bill
- View Bill
- Delete Bill

---

## 7.4 Search and Filters

### Features

- Search by Medicine Name
- Search by Remarks
- Filter by Date
- Filter by Month
- Filter by Price Range

---

## 7.5 Analytics

### Description

Visual representation of spending patterns.

### Graphs

#### Daily Expense Trend

Displays daily expenses.

#### Weekly Expense Trend

Displays weekly spending.

#### Monthly Expense Trend

Displays monthly expenses.

#### Medicine Distribution

Shows spending per medicine.

---

## 7.6 Reports

### Description

Generate expense reports.

### Report Types

- Daily Report
- Weekly Report
- Monthly Report
- Yearly Report

### Export Formats

- PDF
- Excel

---

## 7.7 Sharing System

### Description

Share reports and workspaces.

### Public Share Link

Example:

https://app.domain.com/share/abc123

### Permissions

- View Only

---

## Editor Share Link

Example:

https://app.domain.com/editor/abc123

### Permissions

- Add Bills
- Edit Bills

---

## Workspace Roles

### Owner

Permissions:

- Full Access
- Delete Records
- Manage Users
- Create Share Links

---

### Editor

Permissions:

- Create Records
- Edit Records

---

### Viewer

Permissions:

- Read Only

---

## 7.8 Real-Time Collaboration

### Description

All users see updates instantly.

### Features

- Live Updates
- Instant Sync
- Realtime Dashboard Refresh

### Technology

- Supabase Realtime

---

# 8. Functional Requirements

## FR-001

System shall allow user registration.

---

## FR-002

System shall allow secure login.

---

## FR-003

System shall allow password reset.

---

## FR-004

System shall allow adding billing records.

---

## FR-005

System shall automatically calculate final price.

---

## FR-006

System shall allow editing records.

---

## FR-007

System shall allow deleting records.

---

## FR-008

System shall provide search functionality.

---

## FR-009

System shall provide filtering functionality.

---

## FR-010

System shall display graphical analytics.

---

## FR-011

System shall generate reports.

---

## FR-012

System shall export reports.

---

## FR-013

System shall support public sharing.

---

## FR-014

System shall support collaborative editing.

---

## FR-015

System shall synchronize data in real time.

---

# 9. Non-Functional Requirements

## Performance

- Dashboard load < 2 seconds
- Search response < 1 second
- Report generation < 5 seconds

---

## Security

- JWT Authentication
- Row Level Security (RLS)
- HTTPS
- Protected APIs

---

## Scalability

- Support 10,000+ records
- Support multiple workspaces
- Support multiple users

---

## Reliability

- 99.9% uptime
- Automatic backups

---

## Usability

- Mobile Friendly
- Responsive Design
- Easy Data Entry

---

# 10. Technical Stack

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- ShadCN UI
- Recharts

---

## Backend Services

### Supabase

Used for:

- Authentication
- PostgreSQL Database
- Realtime
- Storage

---

## Deployment

### Frontend

- Vercel

### Backend Services

- Supabase

---

# 11. Success Metrics

## Business Metrics

- Daily Active Users
- Monthly Active Users
- Number of Bills Recorded

---

## Product Metrics

- Average Data Entry Time < 10 seconds
- Dashboard Load Time < 2 seconds
- Error Rate < 1%

---

# 12. Future Roadmap

## Phase 2

- Medicine Inventory Management
- Stock Alerts
- Supplier Management

---

## Phase 3

- Feed Expense Tracking
- Electricity Expense Tracking
- Labor Expense Tracking

---

## Phase 4

- Mobile Application
- Offline Support
- AI Expense Analysis

---

# 13. Project Acceptance Criteria

The project shall be considered complete when:

- Authentication is functional.
- Billing management is functional.
- Dashboard analytics are functional.
- Public sharing is functional.
- Role-based collaboration is functional.
- Reports can be exported.
- Realtime updates are working.
- Application is mobile responsive.
- Supabase integration is fully operational.

---

# End of PRD