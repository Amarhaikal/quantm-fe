import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header';
import { PageContainerComponent } from '../../../shared/components/layout/page-container/page-container';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models/customer.model';

@Component({
  selector: 'app-customer-details',
  imports: [PageHeaderComponent, PageContainerComponent],
  templateUrl: './customer-details.html',
  styleUrl: './customer-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private customerService = inject(CustomerService);

  loading = signal(false);
  customer = signal<Customer | null>(null);

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
