import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MenuService } from '../services/menu.service';
import { map, catchError, of } from 'rxjs';

export const menuGuard: CanActivateFn = (route, state) => {
  const menuService = inject(MenuService);
  const router = inject(Router);

  return menuService.getMenu().pipe(
    map((response) => {
      if (response && response.status === 200 && response.result) {
        const menus: any[] = response.result;
        
        // Flatten menus to a list of allowed URLs
        const allowedUrls: string[] = [];
        const extractUrls = (items: any[]) => {
          items.forEach((item) => {
            if (item.url) {
              allowedUrls.push(item.url);
            }
            if (item.childs && item.childs.length > 0) {
              extractUrls(item.childs);
            }
          });
        };
        
        extractUrls(menus);
        
        const targetUrl = state.url.split('?')[0]; // discard query params
        
        // Exact match for root or dashboard
        if (targetUrl === '/' || targetUrl === '/dashboard') {
          return true; // Dashboard is explicitly allowed or default allowed for authenticated users typically
        }

        // Check if the current URL starts with any of the allowed menu URLs
        const isAllowed = allowedUrls.some((url) => {
          if (url === '/') return false; // Ignore root here since it's already handled, we don't want '/' to match everything
          
          // E.g. targetUrl "/system-admin/users/add" matches allowed url "/system-admin/users"
          return targetUrl === url || targetUrl.startsWith(`${url}/`);
        });
        
        if (isAllowed) {
          return true;
        } else {
          router.navigate(['/']); // Redirect to dashboard if unauthorized
          return false;
        }
      }
      
      router.navigate(['/']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/']);
      return of(false);
    })
  );
};
