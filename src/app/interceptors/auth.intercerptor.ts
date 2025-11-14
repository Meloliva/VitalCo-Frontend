import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  const publicUrls = ['/authenticate', '/registrarUsuario', '/listarRoles'];

  if (publicUrls.some(url => req.url.includes(url))) {
    return next(req);
  }

  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token');

    if (token) {
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('🔐 Token enviado:', token.substring(0, 20) + '...');
      return next(clonedRequest);
    }
  }

  return next(req);
};
