import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TableColumn } from '../../shared/components/data/table/table.model';

export interface DashboardStats {
  totalLoans: number;
  activeCustomers: number;
  pendingApplications: number;
  totalDrawdowns: number;
}

export interface ChartData {
  labels: string[];
  datasets: any[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor() {}

  getStats(): Observable<DashboardStats> {
    return of({
      totalLoans: 1250,
      activeCustomers: 850,
      pendingApplications: 45,
      totalDrawdowns: 3200000,
    });
  }

  getApplicationStatusChart(): Observable<ChartData> {
    return of({
      labels: ['Approved', 'Pending', 'Rejected', 'In Review'],
      datasets: [
        {
          data: [300, 50, 100, 75],
          backgroundColor: ['#22c55e', '#eab308', '#ef4444', '#3b82f6'],
          hoverBackgroundColor: ['#16a34a', '#ca8a04', '#dc2626', '#2563eb'],
        },
      ],
    });
  }

  getAccountOpeningTrendChart(): Observable<ChartData> {
    return of({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'New Accounts',
          data: [65, 59, 80, 81, 56, 120],
          backgroundColor: '#6366f1',
          borderColor: '#4f46e5',
          borderWidth: 1,
        },
      ],
    });
  }

  getDrawdownTrendChart(): Observable<ChartData> {
    return of({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      datasets: [
        {
          label: 'Drawdown Amount (RM)',
          data: [280000, 480000, 400000, 190000, 860000, 270000, 900000],
          fill: false,
          borderColor: '#10b981',
          tension: 0.4,
        },
      ],
    });
  }

  getRecentActivityColumns(): TableColumn[] {
    return [
      { field: 'id', header: 'ID', width: '80px' },
      { field: 'description', header: 'Description', type: 'text' },
      { field: 'user', header: 'User', type: 'text' },
      { field: 'date', header: 'Date', type: 'date' },
      { field: 'status', header: 'Status', type: 'badge' },
    ];
  }

  getRecentActivityData(): Observable<any[]> {
    return of([
      {
        id: 1001,
        description: 'New Application Submitted - Personal Loan',
        user: 'Ali bin Ahmad',
        date: '2023-10-25T10:30:00',
        status: 'PENDING',
      },
      {
        id: 1002,
        description: 'Customer Profile Updated',
        user: 'Siti Sarah',
        date: '2023-10-25T09:15:00',
        status: 'SUCCESS',
      },
      {
        id: 1003,
        description: 'Loan Disbursement Approved',
        user: 'System Admin',
        date: '2023-10-24T16:45:00',
        status: 'APPROVED',
      },
      {
        id: 1004,
        description: 'Account Maintenance - Address Change',
        user: 'Tan Wei Ming',
        date: '2023-10-24T14:20:00',
        status: 'SUCCESS',
      },
      {
        id: 1005,
        description: 'Credit Check Failed',
        user: 'System',
        date: '2023-10-24T11:00:00',
        status: 'FAILED',
      },
    ]);
  }
}
