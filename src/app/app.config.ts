import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  ErrorHandler,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { APP_INITIALIZER } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { MessageService, ConfirmationService } from 'primeng/api';
import { unauthorizedInterceptor } from './core/auth/unauthorized.interceptor';
import { provideTransloco } from '@ngneat/transloco';
import { isDevMode } from '@angular/core';
import { translocoLoader } from './core/i18n/transloco-loader';
import { DatePipe } from '@angular/common';
import { STORAGE_KEYS } from './core/constants/storage.constants';

import { routes } from './app.routes';

import { environment } from '../environments/environment';
import {
  IPublicClientApplication,
  PublicClientApplication,
  BrowserCacheLocation,
} from '@azure/msal-browser';
import { MsalService, MsalBroadcastService, MSAL_INSTANCE } from '@azure/msal-angular';

import { ApmModule, ApmService, ApmErrorHandler } from '@elastic/apm-rum-angular';
import './core/apm.config';

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.azureAd.clientId,
      authority: environment.azureAd.authority,
      redirectUri: environment.azureAd.redirectUri,
      postLogoutRedirectUri: environment.azureAd.redirectUri,
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
    },
  });
}

export function MSALInitializerFactory(msalService: MsalService) {
  return () => {
    return msalService.instance.initialize();
  };
}

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
    DatePipe,
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    MsalService,
    MsalBroadcastService,
    {
      provide: APP_INITIALIZER,
      useFactory: MSALInitializerFactory,
      deps: [MsalService],
      multi: true,
    },
    importProvidersFrom(ApmModule),
    ApmService,
    {
      provide: ErrorHandler,
      useClass: ApmErrorHandler,
    },
  ],
};
