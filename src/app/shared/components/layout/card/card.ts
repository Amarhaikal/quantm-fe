import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="
        'bg-white rounded-2xl border border-gray-200 shadow-sm ' +
        (padding() ? 'p-4 md:p-6' : '') +
        ' ' +
        customClass()
      "
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
    `,
  ],
})
export class CardComponent {
  padding = input<boolean>(true);
  customClass = input<string>('');
}
