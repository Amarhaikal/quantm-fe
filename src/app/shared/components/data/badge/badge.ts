import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeSeverity =
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'secondary'
  | 'dark'
  | 'light';

@Component({
  selector: 'lib-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.html',
  styleUrl: './badge.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  label = input.required<string>();
  severity = input<BadgeSeverity>('secondary');

  containerClass = computed(() => {
    const base =
      'inline-flex items-center justify-center px-2.5 py-1.5 rounded-md text-[10px] leading-none font-bold border text-center uppercase tracking-wider';
    const severities: Record<BadgeSeverity, string> = {
      success: 'bg-emerald-100 text-emerald-700 border-emerald-100',
      danger: 'bg-rose-100 text-rose-700 border-rose-100',
      warning: 'bg-amber-100 text-amber-700 border-amber-100',
      info: 'bg-indigo-100 text-indigo-700 border-indigo-100',
      secondary: 'bg-slate-100 text-slate-700 border-slate-100',
      dark: 'bg-gray-700 text-white border-gray-700',
      light: 'bg-white text-black border-gray-200 shadow-sm',
    };
    return `${base} ${severities[this.severity()]}`;
  });
}
