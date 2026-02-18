import { Component, input, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@ngneat/transloco';

@Component({
  selector: 'lib-page-header',
  standalone: true,
  imports: [CommonModule, TranslocoPipe],
  templateUrl: './page-header.html',
  styleUrl: './page-header.css',
})
export class PageHeaderComponent {
  private location = inject(Location);
  private router = inject(Router);

  title = input.required<string>();
  showBack = input<boolean>(false);
  backUrl = input<string | undefined>();

  handleBack() {
    if (this.backUrl()) {
      this.router.navigate([this.backUrl()]);
    } else {
      this.location.back();
    }
  }
}
