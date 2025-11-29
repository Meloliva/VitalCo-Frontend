import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {authInterceptor} from './interceptors/auth.intercerptor';
import {provideAnimations} from '@angular/platform-browser/animations';
import {FacebookLoginProvider, GoogleLoginProvider, SocialAuthServiceConfig} from '@abacritt/angularx-social-login';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes), provideClientHydration(withEventReplay()), provideHttpClient(withFetch()),
      provideHttpClient(
        withInterceptors([authInterceptor])
      ),
    provideAnimations(),
    // Configuración Social Login
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider('1140767788040046')
          }
        ],
        onError: (err: any) => {
          console.error('Error en Social Login:', err);
        }
      } as SocialAuthServiceConfig,
    }
  ]
};
