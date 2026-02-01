import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user exists in localStorage (since cookie is HttpOnly)
  const user = localStorage.getItem('user');

  if (user) {
    return true;
  }

  // Redirect to login if not authenticated
  router.navigate(['/auth/login']);
  return false;
};
