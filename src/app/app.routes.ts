import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';
import { Beneficios } from './beneficios/beneficios';
import { Planes } from './planes/planes';
import { Testimonios } from './testimonios/testimonios';
import { CentroDeAyuda } from './centro-de-ayuda/centro-de-ayuda';
import {IniciarSecion} from './iniciarsecion/iniciarsecion';
import { SeleccionRegistro } from './seleccion-registro/seleccion-registro';
import {Registro} from './registro/registro';

export const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: 'inicio', component: Inicio },
  { path: 'beneficios', component: Beneficios },
  { path: 'planes', component: Planes },
  { path: 'testimonios', component: Testimonios },
  { path: 'centro-de-ayuda', component: CentroDeAyuda },
  { path: 'iniciosecion', component: IniciarSecion },
  { path: 'registro', component: SeleccionRegistro },
  { path: 'registro-nutricionista', component: Registro }
];
