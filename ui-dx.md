# Aqua Billing Management System (ABMS)

# UI/UX Design Specification

**Version:** 1.0  
**Date:** June 2026  
**Product:** Aqua Billing Management System  
**Platform:** Responsive Web Application  
**Prepared For:** Product Design & Development Team

---

# 1. Design Vision

## Overview

The Aqua Billing Management System (ABMS) should provide a clean, modern, and professional dashboard experience specifically designed for aqua farm owners and managers.

The interface should prioritize:

- Simplicity
- Fast data entry
- Mobile responsiveness
- Easy analytics visualization
- Clear financial insights
- Collaboration

---

# 2. Design Principles

## 2.1 Simplicity First

Users should be able to:

- Add a bill within 10 seconds
- View expense summaries instantly
- Access reports with minimal navigation

---

## 2.2 Mobile First

The application will primarily be used:

- On mobile devices
- In farm environments
- During field operations

The design must work flawlessly on:

- Mobile
- Tablet
- Desktop

---

## 2.3 Data Driven

The dashboard should emphasize:

- Expense tracking
- Spending trends
- Analytics
- Reports

---

## 2.4 Consistency

All pages should maintain:

- Consistent spacing
- Typography
- Colors
- Components
- Navigation patterns

---

# 3. Design Language

## Style

Modern SaaS Dashboard

Inspired By:

- Notion
- Stripe Dashboard
- Linear
- Supabase Dashboard

---

# 4. Color System

## Primary Colors

### Aqua Primary

```css
#0F766E
```

Used For:

- Buttons
- Links
- Active Navigation
- Charts

---

### Aqua Secondary

```css
#14B8A6
```

Used For:

- Hover States
- Secondary Actions
- Graph Highlights

---

## Semantic Colors

### Success

```css
#22C55E
```

---

### Warning

```css
#F59E0B
```

---

### Error

```css
#EF4444
```

---

### Info

```css
#3B82F6
```

---

## Background Colors

### Main Background

```css
#F8FAFC
```

---

### Card Background

```css
#FFFFFF
```

---

### Sidebar Background

```css
#FFFFFF
```

---

## Border Colors

```css
#E2E8F0
```

---

# 5. Typography

## Font Family

### Primary Font

```text
Inter
```

Fallback:

```text
System UI
```

---

# Typography Scale

## Page Title

```css
Font Size: 32px
Weight: 700
```

---

## Section Title

```css
Font Size: 24px
Weight: 600
```

---

## Card Title

```css
Font Size: 18px
Weight: 600
```

---

## Body Text

```css
Font Size: 14px
Weight: 400
```

---

## Caption

```css
Font Size: 12px
Weight: 400
```

---

# 6. Layout Structure

## Desktop Layout

```text
┌───────────────────────────────────────────────┐
│ Header                                        │
├────────────┬──────────────────────────────────┤
│ Sidebar    │ Main Content                     │
│            │                                  │
│            │ Dashboard Cards                  │
│            │ Analytics                        │
│            │ Tables                           │
│            │ Reports                          │
└────────────┴──────────────────────────────────┘
```

---

## Mobile Layout

```text
┌───────────────────────┐
│ Header                │
├───────────────────────┤
│ Dashboard Cards       │
├───────────────────────┤
│ Graphs                │
├───────────────────────┤
│ Bills                 │
├───────────────────────┤
│ Bottom Navigation     │
└───────────────────────┘
```

---

# 7. Navigation Design

## Sidebar Navigation

### Menu Items

```text
Dashboard
Bills
Reports
Analytics
Shared Links
Settings
```

---

## Navigation Icons

Dashboard:

```text
📊
```

Bills:

```text
🧾
```

Reports:

```text
📄
```

Analytics:

```text
📈
```

Sharing:

```text
🔗
```

Settings:

```text
⚙️
```

---

# 8. Page Specifications

# 8.1 Login Page

## Purpose

Allow users to securely access the application.

---

## Components

### Logo

Position:

```text
Top Center
```

---

### Login Form

Fields:

```text
Email
Password
```

---

### Buttons

```text
Sign In
Continue with Google
Forgot Password
```

---

## Layout

```text
┌─────────────────────┐
│       Logo          │
│                     │
│ Email               │
│ Password            │
│                     │
│ [ Sign In ]         │
│                     │
│ Continue with Google│
│                     │
│ Forgot Password     │
└─────────────────────┘
```

---

# 8.2 Dashboard Page

## Purpose

Provide overview of farm expenses.

---

## Components

### Statistic Cards

Card 1

```text
Total Bills
```

Card 2

```text
Total Expenses
```

Card 3

```text
Discount Saved
```

Card 4

```text
Monthly Expense
```

---

### Layout

```text
┌──────┬──────┬──────┬──────┐
│Card 1│Card 2│Card 3│Card 4│
└──────┴──────┴──────┴──────┘
```

---

### Analytics Graph

Position:

```text
Below Statistic Cards
```

Graph Types:

- Line Chart
- Bar Chart
- Pie Chart

---

### Recent Bills Table

Columns:

```text
Medicine
MRP
Discount
Final Price
Date
Remarks
```

---

# 8.3 Add Bill Page

## Purpose

Allow users to create billing records.

---

## Form Layout

```text
Medicine Name
MRP
Discount
Final Price (Auto)

Date
Remarks

[ Save Bill ]
```

---

## Auto Calculation

Formula:

```text
Final Price = MRP - (MRP × Discount ÷ 100)
```

---

## Validation

Medicine Name:

```text
Required
```

MRP:

```text
Must be greater than zero
```

Date:

```text
Required
```

---

# 8.4 Bills Management Page

## Purpose

Manage billing records.

---

## Components

### Search Bar

Placeholder:

```text
Search medicine...
```

---

### Filters

```text
Date Range
Month
Price Range
```

---

### Table

Columns:

```text
Medicine Name
MRP
Discount
Final Price
Date
Remarks
Actions
```

---

### Actions

```text
Edit
Delete
View
```

---

# 8.5 Analytics Page

## Purpose

Provide visual insights.

---

## Graph Sections

### Daily Expense Trend

Chart:

```text
Line Chart
```

---

### Weekly Expense Trend

Chart:

```text
Bar Chart
```

---

### Monthly Expense Trend

Chart:

```text
Line Chart
```

---

### Medicine Distribution

Chart:

```text
Pie Chart
```

---

# 8.6 Reports Page

## Purpose

Generate downloadable reports.

---

## Components

### Date Selector

```text
From Date
To Date
```

---

### Report Type

```text
Daily
Weekly
Monthly
Yearly
```

---

### Export Buttons

```text
Export PDF
Export Excel
```

---

# 8.7 Shared Links Page

## Purpose

Manage shared access.

---

## Components

### Generate Link

Options:

```text
Public View Link
Editor Link
```

---

### Generated Link Card

```text
https://app.domain.com/share/abc123

[ Copy ]
[ Disable ]
```

---

## Permissions Table

| Role | View | Edit | Delete |
|--------|--------|--------|--------|
| Owner | Yes | Yes | Yes |
| Editor | Yes | Yes | No |
| Viewer | Yes | No | No |

---

# 8.8 Settings Page

## Sections

### Profile Settings

```text
Name
Email
Password
```

---

### Workspace Settings

```text
Workspace Name
Workspace Members
```

---

### Theme Settings

```text
Light Mode
Dark Mode
System
```

---

# 9. Component Library

## Buttons

### Primary Button

```css
Background: #0F766E
Text: White
Border Radius: 12px
```

---

### Secondary Button

```css
Background: White
Border: 1px Solid #E2E8F0
```

---

## Cards

```css
Background: White
Radius: 16px
Shadow: Small
Padding: 20px
```

---

## Inputs

```css
Height: 44px
Radius: 12px
Border: #E2E8F0
```

---

## Tables

Features:

- Sticky Header
- Sorting
- Search
- Responsive

---

# 10. Responsive Design

## Mobile

Width:

```text
320px - 768px
```

Layout:

```text
Single Column
```

---

## Tablet

Width:

```text
768px - 1024px
```

Layout:

```text
Two Columns
```

---

## Desktop

Width:

```text
1024px+
```

Layout:

```text
Sidebar + Content
```

---

# 11. Accessibility

## Requirements

### Color Contrast

Minimum:

```text
WCAG AA
```

---

### Keyboard Navigation

Support:

```text
Tab Navigation
```

---

### Screen Readers

Support:

```text
ARIA Labels
```

---

# 12. Micro Interactions

## Button Hover

```text
Slight Scale
```

---

## Save Success

```text
Toast Notification
```

Example:

```text
Bill Added Successfully
```

---

## Delete Confirmation

Modal:

```text
Are you sure you want to delete this bill?
```

---

# 13. Dark Mode

## Supported

Yes

---

## Background

```css
#0F172A
```

---

## Card Background

```css
#1E293B
```

---

## Text

```css
#F8FAFC
```

---

# 14. Design Deliverables

The final UI design should include:

- Design System
- Component Library
- Responsive Layouts
- Dashboard Design
- Billing Management Screens
- Reports Screens
- Sharing Screens
- Dark Mode Variants

---

# End of UI/UX Design Specification