import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header';
import { PageContainerComponent } from '../../../shared/components/layout/page-container/page-container';
import { CardComponent } from '../../../shared/components/layout/card/card';
import { TabsModule } from 'primeng/tabs';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models/customer.model';
import { CustomerGeneral } from './general/general';
import { CustomerDirectors } from './directors/directors';
import { CustomerShareholders } from './shareholders/shareholders';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [
    PageHeaderComponent,
    PageContainerComponent,
    CardComponent,
    TabsModule,
    CustomerGeneral,
    CustomerDirectors,
    CustomerShareholders,
  ],
  templateUrl: './customer-details.html',
  styleUrl: './customer-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private customerService = inject(CustomerService);

  loading = signal(false);
  customer = signal<Customer | null>(null);

  activeTab = signal('general');

  readonly tabs = [
    { label: 'General', value: 'general', icon: 'pi pi-building' },
    { label: 'Directors', value: 'directors', icon: 'pi pi-users' },
    { label: 'Shareholders', value: 'shareholders', icon: 'pi pi-chart-pie' },
  ];

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    this.customerService.getCustomerById(id).subscribe({
      next: (response) => {
        this.customer.set(response.result);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
