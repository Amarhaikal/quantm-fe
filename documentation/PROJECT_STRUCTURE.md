# Project Folder Structure

This document outlines the recommended folder structure for the Loan Management System, covering both the Angular Frontend and ASP.NET Core Backend.

## 1. Angular Frontend Structure

The frontend follows a **Feature-Based Architecture** to ensure modularity and scalability.

```text
src/
├── app/
│   ├── core/                 # Singleton services, guards, interceptors, models
│   │   ├── auth/             # Auth service, guards, interceptors
│   │   ├── config/           # App configuration (e.g., API endpoints)
│   │   ├── models/           # Global interfaces/types (User, API Response)
│   │   └── services/         # Global services (Loading, Notification)
│   │
│   ├── shared/               # Reusable components, pipes, directives
│   │   ├── components/       # Dumb components (e.g., custom table wrapper, confirm dialog)
│   │   ├── directives/       # Custom directives
│   │   ├── pipes/            # Custom pipes
│   │   └── ui/               # PrimeNG wrappers or UI-kit specific components
│   │
│   ├── layout/               # Main application layout
│   │   ├── components/       # Header, Sidebar, Footer, Breadcrumb
│   │   └── main-layout/      # Wrapper component for authenticated pages
│   │
│   ├── features/             # Business Logic Modules (Lazy Loaded)
│   │   ├── auth/             # Login, Forgot Password
│   │   │   ├── pages/        # Login Page Component
│   │   │   └── components/   # Login Form Component
│   │   │
│   │   ├── system-admin/     # System Administration Module (Phase 1)
│   │   │   ├── user/         # User Management
│   │   │   ├── parameter/    # Parameter Management
│   │   │   └── security/     # Security & Audit Logs
│   │   │
│   │   ├── customer/         # Customer Management (Phase 2)
│   │   └── loan/             # Loan Processing (Phase 3)
│   │
│   ├── app.routes.ts         # Main application routing
│   └── app.component.ts      # Root component
```

### Key Principles

- **Core**: Loaded once, singleton services.
- **Shared**: Imported by features that need them. Common UI elements.
- **Features**: Lazy-loaded modules. Each feature contains its own routing, state management (if needed), and specific components.

---

## 2. ASP.NET Core Backend Structure

The backend follows a **Clean Architecture** (or N-Tier) approach to separate concerns and ensure testability.

```text
LoanManagement.Solution/
├── src/
│   ├── LoanManagement.API/              # Entry point, Controllers
│   │   ├── Controllers/                 # REST API Endpoints
│   │   ├── Extensions/                  # Service Registration Extensions
│   │   ├── Middlewares/                 # Exception Handling, Logging
│   │   └── appsettings.json             # Configuration
│   │
│   ├── LoanManagement.Core/             # Application Logic (Domain Layer)
│   │   ├── Entities/                    # Database Models (User, Role, Parameter)
│   │   ├── Interfaces/                  # Repository & Service Interfaces
│   │   ├── DTOs/                        # Data Transfer Objects
│   │   ├── Enums/                       # System Enums
│   │   └── Exceptions/                  # Custom Domain Exceptions
│   │
│   ├── LoanManagement.Infrastructure/   # Data Access & External Services
│   │   ├── Data/                        # Ef Core DbContext & Configurations
│   │   ├── Repositories/                # Repository Implementations
│   │   ├── Services/                    # External Service Implementations (Email, File)
│   │   └── Migrations/                  # EF Core Migrations
│   │
│   └── LoanManagement.Services/         # Business Logic Layer
│       ├── Auth/                        # Authentication Logic
│       ├── SystemAdmin/                 # User & Parameter Logic
│       └── Mappings/                    # AutoMapper Profiles
│
└── tests/                               # Unit and Integration Tests
```

### Key Principles

- **API**: The presentation layer. Light controllers, mostly delegating to Services.
- **Core**: The heart of the system. Contains entities and interfaces. has NO dependencies on other layers.
- **Infrastructure**: Implements interfaces. Handles Database (EF Core), File System, etc.
- **Services**: Contains the business rules. Orchestrates data flow between API and Infrastructure.
