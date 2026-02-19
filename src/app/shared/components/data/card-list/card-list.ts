import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  input,
  output,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'lib-card-list',
  standalone: true,
  imports: [CommonModule, PaginatorModule, SkeletonModule],
  templateUrl: './card-list.html',
  styleUrl: './card-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardListComponent {
  data = input<any[]>([]);
  totalRecords = input<number>(0);
  rows = input<number>(10);
  first = input<number>(0);
  loading = input<boolean>(false);

  // TemplateRef for custom card content
  cardTemplate = contentChild<TemplateRef<any>>('cardTemplate');

  onPageChange = output<any>();
}
