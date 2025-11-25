import { Routes, CanActivateFn } from '@angular/router';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { PrivateLayout } from './layouts/private-layout/private-layout';
import {PrivateLayoutNutricionista} from './layouts/private-layout-nutricionista/private-layout-nutricionista';
import {DatosSaludComponent} from './registro-usuario/datos-salud/datos-salud';
import {RegistroUsuarioComponent} from './registro-usuario/registro-usuario';
import {ListarCitasNutricionista} from './citas-nutricionista/listar/listar';
import { inject, PLATFORM_ID } from '@angular/core'; // <-- Importaciones añadidas
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './service/auth.service';
import { isPlatformBrowser } from '@angular/common';


// Función de guardia para proteger las rutas por roles
const roleGuard = (expectedRoles: string[]): CanActivateFn => {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) {
      // Permitir la renderización en SSR, la verificación real se hace en el cliente.
      return true;
    }

    if (!authService.isLoggedIn()) {
      alert('Debes iniciar sesión para acceder a esta ruta.');
      router.navigate(['/iniciarsesion']);
      return false;
    }

    const userRoles = authService.getRoles().map(r => r.replace('ROLE_', ''));
    const isAuthorized = userRoles.some(role => expectedRoles.includes(role));

    if (!isAuthorized) {
      alert('Acceso denegado. Serás redirigido a tu perfil.');
      // Redirigir basado en el rol de más alto privilegio del usuario
      if (userRoles.includes('NUTRICIONISTA')) {
        router.navigate(['/nutricionista/perfil']);
      } else if (userRoles.includes('PACIENTE')) {
        router.navigate(['/sistema/perfil-paciente']);
      } else {
        router.navigate(['/inicio']);
      }
      return false;
    }

    return true;
  };
};


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
    canActivate: [roleGuard(['NUTRICIONISTA'])], // <-- GUARDIA DE NUTRICIONISTA
    children: [
      {
        path: 'perfil',
        loadComponent: () =>
          import('./perfilnutricionista/perfil').then(m => m.PerfilNutricionistaComponent)},
      {
        path: 'recetas-nutricionista',
        children: [
          {
            path: 'registrar',
            loadComponent: () => import('./recetas-nutricionista/registrar/registrar').then(m => m.RegistrarRecetaNutricionista)
          },
          {
            path: 'listar',
            loadComponent: () => import('./recetas-nutricionista/listar/listar').then(m => m.ListarRecetasNutricionista)
          },
          {
            path: 'editar/:id',
            loadComponent: () =>
              import('./recetas-nutricionista/registrar/registrar')
                .then(m => m.RegistrarRecetaNutricionista)
          }

        ]
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
            loadComponent: () => import('./citas-nutricionista/programar/programar').then(m => m.ProgramarCitasNutricionista)
          },
          {
            path: 'listar',
            loadComponent: () => import('./citas-nutricionista/listar/listar').then(m => m.ListarCitasNutricionista)
          }
        ]
      }
    ]
  },

  {
    path: 'sistema',
    component: PrivateLayout,
    canActivate: [roleGuard(['PACIENTE'])], // <-- GUARDIA DE PACIENTE
    children: [
      { path: '', redirectTo: '/sistema/progreso-paciente', pathMatch: 'full' },
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
      {path:'progreso-paciente',loadComponent:()=>import('./progreso-paciente/progreso-paciente').then(m=>m.ProgresoPaciente)},
      { path: 'cambiar-plan', loadComponent: () => import('./cambiar-plan/cambiar-plan').then(m => m.CambiarPlan) },
      { path: 'perfil-paciente',loadComponent:()=>import('./perfil-paciente/perfil-paciente').then(m=>m.PerfilPacienteComponent)}
    ]
  }
];
