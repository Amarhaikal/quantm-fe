import { HttpClient } from '@angular/common/http';
import { TRANSLOCO_LOADER, Translation, TranslocoLoader } from '@ngneat/transloco';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);

  getTranslation(lang: string) {
    return this.http.get<Translation>(`/assets/i18n/${lang}.json`);
  }
}

export const translocoLoader = {
  provide: TRANSLOCO_LOADER,
  useClass: TranslocoHttpLoader,
};
