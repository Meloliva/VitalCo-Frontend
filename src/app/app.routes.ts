// @ts-ignore

import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { PrivateLayout } from './layouts/private-layout/private-layout';
import {PrivateLayoutNutricionista} from './layouts/private-layout-nutricionista/private-layout-nutricionista';
import {DatosSaludComponent} from './registro-usuario/datos-salud/datos-salud';
import {RegistroUsuarioComponent} from './registro-usuario/registro-usuario';

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
      { path: 'datos-salud',loadComponent: () => import('./registro-usuario/datos-salud/datos-salud').then(m => m.DatosSaludComponent)},
      { path: 'macronutrientes',loadComponent: () => import('./registro-usuario/macronutrientes/macronutrientes').then(m => m.MacronutrientesComponent)},
      { path: 'nivelactividad',loadComponent: () => import('./registro-usuario/nivelactividad/nivelactividad').then(m => m.NivelActividadComponent)},
      { path: 'objetivo',loadComponent: () => import('./registro-usuario/objetivo/objetivo').then(m => m.ObjetivoComponent)},
      { path: 'escoger-plan',loadComponent: () => import('./registro-usuario/escoger-plan/escoger-plan').then(m => m.EscogerPlanComponent)},
      {path: 'registro-usuario',loadComponent: () =>import('./registro-usuario/registro-usuario').then(m=>RegistroUsuarioComponent)},



      {
        path: 'recuperar-password',
        children: [
          {
            path: '',
            loadComponent: () => import('./recuperar-password/recuperar-password').then(m => m.RecuperarPasswordComponent)
          },
          {
            path: 'verificar-codigo',
            loadComponent: () => import('./recuperar-password/verificar-codigo/verificar-codigo').then(m => m.VerificarCodigoComponent)
          },
          {
            path: 'nueva-password',
            loadComponent: () => import('./recuperar-password/nueva-password/nueva-password').then(m => m.NuevaPasswordComponent)
          }
        ]
      },

      {
        path: 'password-success',
        loadComponent: () => import('./recuperar-password/password-success/password-success').then(m => m.PasswordSuccessComponent)
      }

    ]
  },

  {
    path: 'seleccion-registro',
    loadComponent: () => import('./seleccion-registro/seleccion-registro').then(m => m.SeleccionRegistro)
  },

  {
    path: 'nutricionista',
    component: PrivateLayoutNutricionista,
    children: [
      {
        path: 'perfil',
        loadComponent: () => import('./perfilnutricionista/perfil').then(m => m.Perfil)
      },
      {
        path: 'recetas',
        loadComponent: () => import('./recetas/recetas').then(m => m.RecetasComponent)
      },
      {
        path: 'consultar',
        loadComponent: () => import('./consultar/consultar').then(m => m.Consultar)
      },
      {
        path: 'progreso-pacientes',
        loadComponent: () => import('./nutri-progreso-pacientes/nutri-progreso-pacientes').then(m => m.NutriProgresoPacientesComponent)
      },
      {
        path: 'citas',
        children: [
          {
            path: 'programar',
            loadComponent: () => import('./citas-nutricionista/programar/programar').then(m => m.Programar)
          },
          {
            path: 'listar',
            loadComponent: () => import('./citas-nutricionista/listar/listar').then(m => m.Listar)
          }
        ]
      }
    ]
  },

  {
    path: 'sistema',
    component: PrivateLayout,
    children: [
      { path: '', redirectTo: '/progreso-paciente', pathMatch: 'full' },
      {
        path: 'progreso-paciente',
        loadComponent: () => import('./progreso-paciente/progreso-paciente').then(m => m.ProgresoPaciente)
      },
      {
        path: 'citas',
        children: [
          {
            path: 'programar',
            loadComponent: () => import('./citas/programar-cita/programar-cita').then(m => m.ProgramarCita)
          },
          {
            path: 'listar',
            loadComponent: () => import('./citas/listar-citas/listar-citas').then(m => m.ListarCitas)
          }
        ]
      },


      { path: 'receta-paciente', loadComponent: () => import('./receta-paciente/receta-paciente').then(m => m.RecetaPaciente) },
      { path: 'cambiar-plan', loadComponent: () => import('./cambiar-plan/cambiar-plan').then(m => m.CambiarPlan) },
      { path: 'perfil-paciente',loadComponent:()=>import('./perfil-paciente/perfil-paciente').then(m=>m.PerfilPacienteComponent)}

    ]
  }
];
