import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../button/button';
import { CardComponent } from '../card/card';

@Component({
  selector: 'lib-search',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent],
  template: `
    <lib-card [padding]="true">
      <div class="flex flex-col md:flex-row items-stretch md:items-end gap-4">
        <div class="flex-1 w-full">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ng-content></ng-content>
          </div>
        </div>
        <div class="flex flex-none justify-end pt-2 md:pt-0">
          <lib-button type="RESET" (click)="reset.emit()" />
        </div>
      </div>
    </lib-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  reset = output<void>();
}
