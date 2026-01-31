# Loan Management System - Functional Specification

## Technology Stack

- **Backend**: ASP.NET Core
- **Frontend**: Angular with PrimeNG UI Library

---

## Phase 1: Core System & Administration

**Objective**: Establish the foundational security, user management, and system configuration modules.

### 1. Authentication (`Auth`)

- **Login Module**
  - Secure login interface.
  - **No Self-Registration**: Users cannot register themselves. All users must be created by defined Administrators.
  - Role validation upon login (e.g., redirecting to appropriate dashboards).

### 2. System Administration (`System Admin`)

- **User Management**
  - Create, Update, Read, Delete (CRUD) internal system users.
  - Assign Roles and Permissions.
  - Password management (admin reset).
- **Parameter Management**
  - Manage system-wide parameters (e.g., Interest Rates, Currency Codes, Branch Codes).
  - Dynamic configuration of drop-down values used throughout the system.
- **Security**
  - Audit Logs: View login history and critical actions.
  - Role-Based Access Control (RBAC) configuration.
  - Password policies configuration (complexity, expiration).

---

## Phase 2: Entity Management (Future Scope)

**Objective**: Manage the primary entities involved in the loan lifecycle.

### 1. Customer Management

- **Customer Profiles**: Setup for Individual and Corporate customers.
- **KYC Integration**: Fields for uploading and verification of KYC documents.
- **Relationship View**: View all accounts and collaterals linked to a customer.

### 2. Collateral Management

- **Collateral Registration**: Recording assets (Property, Vehicle, Deposits, etc.).
- **Valuation**: Tracking valuation history and dates.
- **Collateral Linkage**: Link collateral to specific customers or facilities.

---

## Phase 3: Loan Lifecycle (Future Scope)

**Objective**: Handle the core business logic of loan origination and servicing.

### 1. Application Processing

- **Loan Origination**: Application entry, eligibility checks, and scoring.
- **Approval Workflow**: Multi-level approval process implementation.

### 2. Account Opening

- **Facility Creation**: Converting approved applications into active loan accounts.
- **Schedule Generation**: Amortization schedule calculation.

### 3. Drawdown

- **Disbursement**: Handling partial or full disbursement of funds.
- **Payment Instructions**: Managing destination accounts for funds transfer.
