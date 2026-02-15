import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@ngneat/transloco';

export type ButtonType = 'CANCEL' | 'SAVE' | 'UPDATE' | 'SAVE_CHANGES' | 'RESET';
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'danger'
  | 'ghost'
  | 'link'
  | 'dark';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonHtmlType = 'button' | 'submit' | 'reset';
export type IconPos = 'left' | 'right';

@Component({
  selector: 'lib-button',
  standalone: true,
  imports: [CommonModule, TranslocoPipe],
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  // Inputs
  type = input<ButtonType | undefined>(undefined);
  htmlType = input<ButtonHtmlType>('button');
  label = input<string>('');
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  icon = input<string>('');
  iconPos = input<IconPos>('left');
  loading = input<boolean>(false);
  disabled = input<boolean>(false);
  block = input<boolean>(false);

  // Computed values
  finalLabel = computed(() => {
    if (this.label()) return this.label();

    switch (this.type()) {
      case 'CANCEL':
        return 'common.buttons.cancel';
      case 'SAVE':
        return 'common.buttons.save';
      case 'UPDATE':
        return 'common.buttons.update';
      case 'SAVE_CHANGES':
        return 'common.buttons.save_changes';
      case 'RESET':
        return 'common.buttons.reset';
      default:
        return '';
    }
  });

  finalIcon = computed(() => {
    if (this.loading()) return 'pi pi-spinner pi-spin';
    if (this.icon()) return this.icon();

    switch (this.type()) {
      case 'CANCEL':
        return 'pi pi-times';
      case 'SAVE':
        return 'pi pi-check';
      case 'UPDATE':
        return 'pi pi-refresh';
      case 'SAVE_CHANGES':
        return 'pi pi-check';
      case 'RESET':
        return 'pi pi-undo';
      default:
        return '';
    }
  });

  finalVariant = computed((): ButtonVariant => {
    const t = this.type();
    // If the variant is explicitly set to something other than primary, respect it
    if (this.variant() !== 'primary') return this.variant();

    if (t === 'CANCEL' || t === 'RESET') return 'secondary';
    return this.variant();
  });

  finalHtmlType = computed((): ButtonHtmlType => {
    if (this.type() === 'RESET') return 'reset';
    return this.htmlType();
  });

  baseClass = computed(() => {
    const classes = [
      'inline-flex items-center justify-center gap-2 rounded-xl transition-all font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed select-none',
      this.block() ? 'w-full' : '',
    ];

    // Sizes
    switch (this.size()) {
      case 'sm':
        classes.push('px-3 py-1.5 text-xs');
        break;
      case 'md':
        classes.push('px-4 py-2 text-sm');
        break;
      case 'lg':
        classes.push('px-6 py-3 text-base');
        break;
    }

    // Variants
    const v = this.finalVariant();
    switch (v) {
      case 'primary':
        classes.push(
          'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500 border border-transparent shadow-sm',
        );
        break;
      case 'secondary':
        classes.push(
          'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 focus-visible:ring-gray-200 shadow-sm',
        );
        break;
      case 'outline':
        classes.push(
          'bg-transparent text-indigo-600 border border-indigo-600 hover:bg-indigo-50 focus-visible:ring-indigo-500',
        );
        break;
      case 'danger':
        classes.push(
          'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 border border-transparent shadow-sm',
        );
        break;
      case 'ghost':
        classes.push(
          'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent focus-visible:ring-gray-200',
        );
        break;
      case 'link':
        classes.push('bg-transparent text-indigo-600 hover:underline border-none p-0! h-auto!');
        break;
      case 'dark':
        classes.push(
          'bg-[#191c32] text-white hover:bg-[#2a2e4d] focus-visible:ring-[#191c32] border border-transparent shadow-sm',
        );
        break;
    }

    return classes.join(' ');
  });
}
