import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ToastModule } from 'primeng/toast';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog';
import { ApmService } from '@elastic/apm-rum-angular';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, ConfirmDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private apmService = inject(ApmService);
  protected readonly title = signal('quantm-fe');

  ngOnInit(): void {
    this.apmService.observe();
  }
}
