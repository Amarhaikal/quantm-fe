import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeSeverity = 'success' | 'danger' | 'warning' | 'info' | 'secondary';

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
      'inline-flex items-center justify-center px-4 py-1 rounded-full text-xs font-semibold border min-w-[70px] text-center';
    const severities: Record<BadgeSeverity, string> = {
      success: 'bg-emerald-100 text-emerald-700 border-emerald-100',
      danger: 'bg-rose-100 text-rose-700 border-rose-100',
      warning: 'bg-amber-100 text-amber-700 border-amber-100',
      info: 'bg-indigo-100 text-indigo-700 border-indigo-100',
      secondary: 'bg-slate-100 text-slate-700 border-slate-100',
    };
    return `${base} ${severities[this.severity()]}`;
  });
}
