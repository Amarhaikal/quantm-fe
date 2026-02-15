import { Injectable, signal } from '@angular/core';

export type LabelPosition = 'top' | 'left';

@Injectable({
  providedIn: 'root',
})
export class AppearanceService {
  /**
   * Global setting for form label position.
   * 'top' - Modern/Normal layout
   * 'left' - Compact layout
   */
  labelPosition = signal<LabelPosition>('top');

  /**
   * Updates the global label position setting.
   */
  setLabelPosition(position: LabelPosition) {
    this.labelPosition.set(position);
  }
}
