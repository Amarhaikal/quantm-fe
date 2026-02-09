import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If already hydrated, handle immediately
  if (authService.isHydrated()) {
    if (authService.currentUser()) {
      return true;
    }
    router.navigate(['/auth/login']);
    return false;
  }

  // If not hydrated (e.g., page refresh), trigger hydration
  return authService.hydrate().pipe(
    map((user) => {
      if (user) {
        return true;
      }
      router.navigate(['/auth/login']);
      return false;
    }),
  );
};
