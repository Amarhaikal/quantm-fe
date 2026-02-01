import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p class="text-gray-600 mt-1">Welcome to Quantm Loan Management System</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Total Loans</h3>
          <p class="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Active Customers</h3>
          <p class="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Pending Applications</h3>
          <p class="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class DashboardComponent {}
