import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { MessageService, ConfirmationService } from 'primeng/api';
import { unauthorizedInterceptor } from './core/auth/unauthorized.interceptor';
import { provideTransloco } from '@ngneat/transloco';
import { isDevMode } from '@angular/core';
import { translocoLoader } from './core/i18n/transloco-loader';
import { STORAGE_KEYS } from './core/constants/storage.constants';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([unauthorizedInterceptor])),
    provideAnimationsAsync(),
    provideTransloco({
      config: {
        availableLangs: ['en', 'my'],
        defaultLang: localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en',
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: translocoLoader.useClass,
    }),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.my-app-dark',
          cssLayer: {
            name: 'primeng',
            order: 'tailwind-base, primeng, tailwind-utilities',
          },
        },
      },
    }),
    MessageService,
    ConfirmationService,
  ],
};
