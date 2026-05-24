import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from './auth.service';

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthError =
        error.status === 401 ||
        (error.status === 404 && error.error?.message === 'Authenticated user not found');

      if (isAuthError) {
        // Clear in-memory user data and redirect to login
        authService.setUser(null);
        toast.sessionExpired();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    }),
  );
};
