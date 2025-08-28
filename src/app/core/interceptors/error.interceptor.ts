import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Só executa no browser para evitar problemas no SSR
      if (isPlatformBrowser(platformId)) {
        if (error.status === 401) {
          // Remove o token do localStorage
          localStorage.removeItem(environment.tokenKey);
          
          // Redireciona para a tela de login
          router.navigate(['/login']);
        }
      }
      
      return throwError(() => error);
    })
  );
};
