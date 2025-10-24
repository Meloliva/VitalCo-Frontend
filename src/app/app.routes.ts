import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';
import { Beneficios } from './beneficios/beneficios';
import { Planes } from './planes/planes';
import { Testimonios } from './testimonios/testimonios';
import { CentroDeAyuda } from './centro-de-ayuda/centro-de-ayuda';

export const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: 'inicio', component: Inicio },
  { path: 'beneficios', component: Beneficios },
  { path: 'planes', component: Planes },
  { path: 'testimonios', component: Testimonios },
  { path: 'centro-de-ayuda', component: CentroDeAyuda }
];
