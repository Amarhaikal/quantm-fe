import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Clear user data and redirect to login
        localStorage.removeItem('user');
        toast.sessionExpired();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    }),
  );
};
