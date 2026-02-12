import { Directive, HostListener } from '@angular/core';
import { HasUnsavedChanges } from '../interfaces/unsaved-changes.interface';

@Directive()
export abstract class BaseFormComponent implements HasUnsavedChanges {
  /**
   * Components extending this class must implement this method
   * to define when the form is considered "dirty" or has unsaved changes.
   */
  abstract hasUnsavedChanges(): boolean;

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedChanges()) {
      $event.returnValue = true;
    }
  }
}
