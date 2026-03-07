import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header';
import { PageContainerComponent } from '../../../shared/components/layout/page-container/page-container';

@Component({
  selector: 'app-customer-add',
  imports: [PageHeaderComponent, PageContainerComponent],
  templateUrl: './customer-add.html',
  styleUrl: './customer-add.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerAdd {}
