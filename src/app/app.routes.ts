import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { PrivateLayout } from './layouts/private-layout/private-layout';

export const routes: Routes = [
  {
    path:'',
    component: PublicLayout,
    children:[
      { path: '', redirectTo: '/inicio', pathMatch: 'full' },
      { path: 'inicio', loadComponent: () => import('./inicio/inicio').then(m => m.Inicio) },
      { path: 'beneficios', loadComponent: () => import('./beneficios/beneficios').then(m => m.Beneficios) },
      { path: 'planes', loadComponent: () => import('./planes/planes').then(m => m.Planes) },
      { path: 'testimonios', loadComponent: () => import('./testimonios/testimonios').then(m => m.Testimonios) },
      { path: 'centro-de-ayuda', loadComponent: () => import('./centro-de-ayuda/centro-de-ayuda').then(m => m.CentroDeAyuda) },
      { path: 'iniciosecion', loadComponent: () => import('./iniciarsecion/iniciarsecion').then(m => m.IniciarSecion) },
      {path: 'registro', loadComponent: () => import('./registro/registro').then(m => m.Registro) },
      {
        path: 'perfil',
        loadComponent: () => import('./perfilnutricionista/perfil').then(m => m.Perfil)
      }
    ]
  },
  {
    path:' ',
    component: PrivateLayout,
    children:[
      { path: '', redirectTo: 'progreso', pathMatch: 'full' },
      /*{ path: 'progreso', loadComponent: () => import('./sistema/progreso/progreso').then(m => m.Progreso) },
      { path: 'perfil', loadComponent: () => import('./sistema/perfil/perfil').then(m => m.Perfil) },
      { path: 'recetas', loadComponent: () => import('./sistema/recetas/recetas').then(m => m.Recetas) },
      { path: 'citas', loadComponent: () => import('./sistema/citas/citas').then(m => m.Citas) },
      { path: 'cambiar-plan', loadComponent: () => import('./sistema/cambiar-plan/cambiar-plan').then(m => m.CambiarPlan) }
*/
    ]
  }

];
