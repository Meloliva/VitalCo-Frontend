import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { PrivateLayout } from './layouts/private-layout/private-layout';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', redirectTo: '/inicio', pathMatch: 'full' },
      { path: 'inicio', loadComponent: () => import('./inicio/inicio').then(m => m.Inicio) },
      { path: 'beneficios', loadComponent: () => import('./beneficios/beneficios').then(m => m.Beneficios) },
      { path: 'planes', loadComponent: () => import('./planes/planes').then(m => m.Planes) },
      { path: 'testimonios', loadComponent: () => import('./testimonios/testimonios').then(m => m.Testimonios) },
      { path: 'centro-de-ayuda', loadComponent: () => import('./centro-de-ayuda/centro-de-ayuda').then(m => m.CentroDeAyuda) },
      { path: 'registro', loadComponent: () => import('./registro/registro').then(m => m.Registro) },
      { path: 'iniciarsesion', loadComponent: () => import('./iniciarsesion/iniciarsesion').then(m => m.Iniciarsesion) },
      { path: 'recuperar-password', loadComponent: () => import('./recuperar-password/recuperar-password').then(m => m.RecuperarPasswordComponent) },
    ]
  },

  // Rutas públicas específicas
  {
    path: 'seleccion-registro',
    loadComponent: () => import('./seleccion-registro/seleccion-registro').then(m => m.SeleccionRegistro)
  },

  // Layout privado (sistema)
  {
    path: 'sistema',
    component: PrivateLayout,
    children: [
      { path: '', redirectTo: '/sistema/progreso-paciente', pathMatch: 'full' },
      {
        path: 'progreso-paciente',
        loadComponent: () =>
          import('./progreso-paciente/progreso-paciente').then(m => m.ProgresoPaciente)
      },
      {
        path: 'perfilnutricionista',
        loadComponent: () =>
          import('./perfilnutricionista/perfil').then(m => m.Perfil)
      },
      {
        path: 'consultar',
        loadComponent: () =>
          import('./consultar/consultar').then(m => m.Consultar)
      }
    ]
  }
];
