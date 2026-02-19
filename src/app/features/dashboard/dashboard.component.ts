import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { TableComponent } from '../../shared/components/data/table/table'; // Adjust path if needed
import { DashboardService, DashboardStats, ChartData } from './dashboard.service';
import { TableColumn } from '../../shared/components/data/table/table.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule, TableComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p class="text-gray-600 mt-1">Welcome to Quantm Loan Management System</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Loans -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-500">Total Loans</h3>
            <div class="p-2 bg-indigo-50 rounded-lg">
              <i class="pi pi-money-bill text-indigo-600 text-xl"></i>
            </div>
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ stats()?.totalLoans }}</p>
          <span class="text-xs text-green-600 font-medium flex items-center gap-1 mt-2">
            <i class="pi pi-arrow-up"></i> 12% increase
          </span>
        </div>

        <!-- Active Customers -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-500">Active Customers</h3>
            <div class="p-2 bg-blue-50 rounded-lg">
              <i class="pi pi-users text-blue-600 text-xl"></i>
            </div>
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ stats()?.activeCustomers }}</p>
          <span class="text-xs text-green-600 font-medium flex items-center gap-1 mt-2">
            <i class="pi pi-arrow-up"></i> 5% increase
          </span>
        </div>

        <!-- Pending Applications -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-500">Pending Apps</h3>
            <div class="p-2 bg-amber-50 rounded-lg">
              <i class="pi pi-file text-amber-600 text-xl"></i>
            </div>
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ stats()?.pendingApplications }}</p>
          <span class="text-xs text-gray-500 font-medium mt-2 block"> Requires attention </span>
        </div>

        <!-- Total Drawdowns -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-500">Total Drawdowns</h3>
            <div class="p-2 bg-emerald-50 rounded-lg">
              <i class="pi pi-wallet text-emerald-600 text-xl"></i>
            </div>
          </div>
          <p class="text-3xl font-bold text-gray-900">RM {{ stats()?.totalDrawdowns | number }}</p>
          <span class="text-xs text-green-600 font-medium flex items-center gap-1 mt-2">
            <i class="pi pi-arrow-up"></i> 8% increase
          </span>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Application Status -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Application Status</h3>
          <div class="flex justify-center h-[300px]">
            <p-chart
              type="doughnut"
              [data]="applicationStatusData()"
              [options]="pieOptions"
              class="w-full h-full flex justify-center"
            ></p-chart>
          </div>
        </div>

        <!-- Account Opening Trend -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Account Opening Trend</h3>
          <div class="h-[300px]">
            <p-chart
              type="bar"
              [data]="accountOpeningInitData()"
              [options]="barOptions"
              class="h-full w-full"
            ></p-chart>
          </div>
        </div>
      </div>

      <!-- Drawdown Trend (Full Width) -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Drawdown Trend</h3>
        <div class="h-[350px]">
          <p-chart
            type="line"
            [data]="drawdownTrendData()"
            [options]="lineOptions"
            class="h-full w-full"
          ></p-chart>
        </div>
      </div>

      <!-- Recent Activity Table -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button
            class="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
          >
            View All
          </button>
        </div>

        <lib-table
          [data]="recentActivityData()"
          [columns]="recentActivityColumns"
          [actionType]="'NONE'"
          [rows]="5"
          [totalRecords]="5"
        ></lib-table>
      </div>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .p-chart canvas {
        width: 100% !important;
        height: 100% !important;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  stats = signal<DashboardStats | null>(null);
  applicationStatusData = signal<ChartData | null>(null);
  accountOpeningInitData = signal<ChartData | null>(null);
  drawdownTrendData = signal<ChartData | null>(null);
  recentActivityData = signal<any[]>([]);

  recentActivityColumns: TableColumn[] = [];

  pieOptions: any;
  barOptions: any;
  lineOptions: any;

  ngOnInit() {
    this.loadData();
    this.initChartOptions();
  }

  loadData() {
    this.dashboardService.getStats().subscribe((data) => this.stats.set(data));
    this.dashboardService
      .getApplicationStatusChart()
      .subscribe((data) => this.applicationStatusData.set(data));
    this.dashboardService
      .getAccountOpeningTrendChart()
      .subscribe((data) => this.accountOpeningInitData.set(data));
    this.dashboardService
      .getDrawdownTrendChart()
      .subscribe((data) => this.drawdownTrendData.set(data));

    this.recentActivityColumns = this.dashboardService.getRecentActivityColumns();
    this.dashboardService
      .getRecentActivityData()
      .subscribe((data) => this.recentActivityData.set(data));
  }

  initChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.pieOptions = {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: textColor,
          },
        },
      },
      maintainAspectRatio: false,
    };

    this.barOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500,
            },
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };

    this.lineOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };
  }
}
