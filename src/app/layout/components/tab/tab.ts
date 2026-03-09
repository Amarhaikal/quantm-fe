import { Component, ChangeDetectionStrategy, input, model } from '@angular/core';
import { Tabs, TabList, Tab, TabPanels } from 'primeng/tabs';

export interface TabItem {
  label: string;
  value: string | number;
  icon?: string;
}

@Component({
  selector: 'app-tab',
  standalone: true,
  imports: [Tabs, TabList, Tab, TabPanels],
  template: `
    <p-tabs [value]="value()" (valueChange)="value.set($any($event))">
      <p-tablist class="px-4 pt-2">
        @for (tab of tabs(); track tab.value) {
          <p-tab [value]="tab.value">
            <div class="flex items-center gap-2 px-2 py-1">
              @if (tab.icon) {
                <i [class]="tab.icon"></i>
              }
              <span class="font-medium text-sm">{{ tab.label }}</span>
            </div>
          </p-tab>
        }
      </p-tablist>
      <p-tabpanels class="p-4 md:p-6">
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
