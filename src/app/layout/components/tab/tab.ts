import { Component, ChangeDetectionStrategy, input, model } from '@angular/core';
import { Tabs, TabList, Tab, TabPanels } from 'primeng/tabs';

export interface TabItem {
  label: string;
  value: string | number;
  icon?: string;
}

@Component({
  selector: 'app-tab',
  imports: [Tabs, TabList, Tab, TabPanels],
  template: `
    <p-tabs [value]="value()" (valueChange)="value.set($any($event))">
      <p-tablist>
        @for (tab of tabs(); track tab.value) {
          <p-tab [value]="tab.value">
            @if (tab.icon) {
              <i [class]="tab.icon + ' mr-2'"></i>
            }
            {{ tab.label }}
          </p-tab>
        }
      </p-tablist>
      <p-tabpanels>
        <ng-content></ng-content>
      </p-tabpanels>
    </p-tabs>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabComponent {
  tabs = input.required<TabItem[]>();
  value = model<string | number>(0);
}
