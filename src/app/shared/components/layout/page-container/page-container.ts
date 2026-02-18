import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-page-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'w-full ' + (padding() ? 'px-4 md:px-0' : '')">
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
export class PageContainerComponent {
  padding = input<boolean>(true);
}
