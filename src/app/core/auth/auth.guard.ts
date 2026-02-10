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
    const user = authService.currentUser();
    console.log('[AuthGuard] Check (Hydrated): User present?', !!user);
    if (user) {
      return true;
    }
    console.warn('[AuthGuard] Access denied (Hydrated, no user). Redirecting to login.');
    router.navigate(['/auth/login']);
    return false;
  }

  console.log('[AuthGuard] Not hydrated, triggering hydration...');
  // If not hydrated (e.g., page refresh), trigger hydration
  return authService.hydrate().pipe(
    map((user) => {
      console.log('[AuthGuard] Hydration completed. User found?', !!user);
      if (user) {
        return true;
      }
      console.warn('[AuthGuard] Access denied (Hydration failed). Redirecting to login.');
      router.navigate(['/auth/login']);
      return false;
    }),
  );
};
