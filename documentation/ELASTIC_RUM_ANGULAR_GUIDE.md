# Elastic APM Real User Monitoring (RUM) - Angular Integration Guide

## Overview

This guide explains how to integrate **Elastic APM RUM** into the `quantm-fe` Angular application.
Once completed, the Kibana dashboard will automatically track:

- Page load times and navigation speeds
- All JavaScript crashes and errors
- User click paths and interactions
- End-to-end distributed traces (Browser → Spring Boot → Database)

---

## Prerequisites

- ELK Stack must be running (including the `apm-server` container on port `8200`).
- APM Server is already configured in `docker-compose-elk.yml` on the backend project.
- Angular project is using Angular 13+ (standard standalone or module-based setup).

---

## Step 1: Install the Elastic RUM Angular Package

Run the following command inside the **Angular project root**:

```bash
npm install @elastic/apm-rum-angular --save
```

---

## Step 2: Initialize the APM Agent

Create a new file: `src/app/core/apm.config.ts`

```typescript
import { init as initApm } from "@elastic/apm-rum";

export const apm = initApm({
  // The name that will appear in your Kibana APM Dashboard
  serviceName: "quantm-fe",

  // ⚠️ LOCAL: Use this URL during local development
  serverUrl: "http://localhost:8200",

  // ⚠️ PRODUCTION: Replace with your VPS IP when deploying
  // serverUrl: 'http://217.217.255.210:8200',

  serviceVersion: "1.0.0",

  // The environment tag shown in Kibana (change to 'production' on server)
  environment: "development",

  // The origins (backend URLs) to include in distributed traces.
  // This links a browser request to its corresponding Spring Boot log in Kibana.
  distributedTracingOrigins: [
    "http://localhost:8080", // Spring Boot Primary
    "http://localhost:8081", // Spring Boot Secondary
    "http://localhost:8000", // Python AI Service
    "https://quantm-bank.com", // Production domain
  ],
});
```

---

## Step 3: Register APM in AppModule

Open `src/app/app.module.ts` and make the following changes:

```typescript
import { NgModule, ErrorHandler } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import {
  ApmModule,
  ApmService,
  ApmErrorHandler,
} from "@elastic/apm-rum-angular";

// Import the apm config we created in Step 2
import "./core/apm.config";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

@NgModule({
  declarations: [
    AppComponent,
    // ... your other components
  ],
  imports: [
    BrowserModule,
    ApmModule, // ← Add this
    AppRoutingModule,
    // ... your other imports
  ],
  providers: [
    ApmService, // ← Add this to enable page load tracking
    {
      // ← Replace the default Angular ErrorHandler with the APM one
      // This automatically catches and reports ALL JavaScript crashes to Kibana
      provide: ErrorHandler,
      useClass: ApmErrorHandler,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

---

## Step 4: Enable Route Tracking (Optional but Recommended)

To track which pages users visit (and how long each page takes to load), open `src/app/app.component.ts`:

```typescript
import { Component, OnInit } from "@angular/core";
import { ApmService } from "@elastic/apm-rum-angular";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  constructor(private apmService: ApmService) {}

  ngOnInit(): void {
    // This tells the APM agent to start tracking Angular route changes
    // For example: When user navigates from /dashboard to /transfer,
    // Kibana will record how long that transition took.
    this.apmService.observe();
  }
}
```

---

## Step 5: (Optional) Custom Transaction Tracking

For critical bank operations (like a money transfer), you can manually track a specific action with more detail:

```typescript
import { Component } from '@angular/core';
import { apm } from '../core/apm.config';

@Component({ ... })
export class TransferComponent {

  onSubmitTransfer() {
    // Start a custom transaction for this important action
    const transaction = apm.startTransaction('transfer-funds', 'user-action');

    this.transferService.submit(this.form.value).subscribe({
      next: (response) => {
        transaction?.end(); // ✅ Mark it as successful
      },
      error: (err) => {
        apm.captureError(err); // ❌ Report the error to Kibana
        transaction?.end();
      }
    });
  }
}
```

---

## Step 6: Verify in Kibana

1. Start your Angular app locally: `ng serve`
2. Navigate to a few pages in your browser.
3. Open Kibana at `http://localhost:5601`.
4. Click **Hamburger Menu (≡)** → **Observability** → **APM**.
5. You should see **`quantm-fe`** appear as a service.
6. Click on it to see:
   - **Transactions**: List of pages visited (e.g., `/dashboard`, `/transfer`).
   - **Errors**: Any JavaScript crashes with full stack traces.
   - **Dependencies**: Which backend APIs the frontend is calling.

---

## Production Deployment Notes

When deploying to the production server (`217.217.255.210`), remember to:

1. **Change `serverUrl`** in `apm.config.ts` from `localhost:8200` to `http://217.217.255.210:8200`.
2. **Change `environment`** from `'development'` to `'production'`.
3. **Start the APM Server** on the backend server:
   ```bash
   docker compose -f docker-compose-elk.yml up -d apm-server
   ```
4. **Open Port 8200** in the server firewall if needed.

---

## Field Reference in Kibana

| Kibana Field              | Value                        | Description                             |
| ------------------------- | ---------------------------- | --------------------------------------- |
| `service.name`            | `quantm-fe`                  | Identifies this as the Angular frontend |
| `service.environment`     | `development` / `production` | The deployment environment              |
| `transaction.name`        | `/dashboard`, `/transfer`    | The page or action being tracked        |
| `error.exception.message` | `Cannot read property...`    | The JavaScript error message            |
| `user_agent.name`         | `Chrome`, `Firefox`          | The browser the user is using           |

---

## ELK Stack Architecture (Complete Picture)

```
[ quantm-fe (Angular) ]          ← RUM Agent → port 8200
[ quantm-be (Spring Boot) ]      ← Logback   → port 5000 (Logstash)
[ quantm-ai (Python FastAPI) ]   ← logstash  → port 5000 (Logstash)
          │
          ▼
    [ Logstash :5000 ]  ──▶  [ Elasticsearch :9200 ]  ──▶  [ Kibana :5601 ]
    [ APM Server :8200 ] ─────────────────────────────────────────────▲
```
