import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UserService } from '../../service/userlayout-service';
import { Usuario } from '../../models/usuario.model';
import { Paciente } from '../../models/paciente.model';
import { Nutricionista } from '../../models/nutricionista.model';
import { Subscription, firstValueFrom } from 'rxjs'; // <-- firstValueFrom agregado
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './private-layout.html',
  styleUrls: ['./private-layout.css'],
})
export class PrivateLayout implements OnInit, OnDestroy {
  userAvatar: string = '/Images/iconos/iconoSistemas/image 18.png';
  userName: string = 'Nombre de Usuario';
  isPremium: boolean = false;
  hidePageCard: boolean = false;
  citasExpanded: boolean = false;
  private userSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.userService.initUserFromStorage();
    this.loadInitialData(); // <-- Inicia la carga de datos del perfil completo
    this.checkRoute();

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkRoute();
        this.checkCitasRoute();
      });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private checkRoute() {
    this.hidePageCard = this.router.url.includes('/cambiar-plan');
  }

  private checkCitasRoute() {
    if (this.router.url.includes('/sistema/citas/')) {
      this.citasExpanded = true;
    }
  }

  toggleCitas() {
    this.citasExpanded = !this.citasExpanded;
  }

  async loadInitialData() {
    // 1. Cargar datos básicos de localStorage (casi instantáneo en el navegador)
    this.loadFromLocalStorage();

    // 2. Intentar cargar el perfil completo del backend (asíncrono, para el estado Premium)
    try {
      const user = await firstValueFrom(this.userService.fetchPerfilAutenticado());

      if (user) {
        // Actualizar el estado con datos frescos
        if ('idusuario' in user) {
          const userWithUsuario = user as Paciente | Nutricionista;
          this.userName = `${userWithUsuario.idusuario.nombre} ${userWithUsuario.idusuario.apellido}`;
          this.userAvatar = userWithUsuario.idusuario.fotoPerfil ?? '/Images/iconos/iconoSistemas/image 18.png';
        } else {
          const usuario = user as Usuario;
          this.userName = `${usuario.nombre} ${usuario.apellido}`;
          this.userAvatar = usuario.fotoPerfil ?? '/Images/iconos/iconoSistemas/image 18.png';
        }
        this.isPremium = this.userService.isPremium();
      }
    } catch (error) {
      // Si el perfil no se carga (ej. 403/401), se asume que la guardia de rutas se encargará.
      console.warn('Fallo al cargar el perfil completo en el Layout. Dependiendo del local storage.');
    }

    // 3. Suscribirse para escuchar cambios futuros
    this.userSubscription = this.userService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          // Esto es lo que actualiza isPremium si hay un cambio de plan en otra página
          this.isPremium = this.userService.isPremium();
          this.userName = this.userService.getUserFullName();
          this.userAvatar = this.userService.getUserAvatar();
        }
      }
    });
  }

  private loadFromLocalStorage() {
    if (!isPlatformBrowser(this.platformId)) return;

    const userPlan = localStorage.getItem('userPlan');
    const userName = localStorage.getItem('userName');
    const userAvatar = localStorage.getItem('userAvatar');

    this.isPremium = userPlan === 'Plan premium';
    this.userName = userName || 'Nombre de Usuario';
    this.userAvatar = userAvatar || '/Images/iconos/iconoSistemas/image 18.png';
  }

  logout() {
    console.log('🚪 Cerrando sesión...');
    if (isPlatformBrowser(this.platformId)) {
      this.userService.clearUser();
      localStorage.removeItem('token');
    }
    this.router.navigate(['/inicio']);
  }

  updateUserAvatar(newAvatarUrl: string) {
    this.userService.getCurrentUser().subscribe({
      next: (currentUser) => {
        if (currentUser) {
          if ('idusuario' in currentUser) {
            const userWithUsuario = currentUser as Paciente | Nutricionista;
            userWithUsuario.idusuario.fotoPerfil = newAvatarUrl;
            this.userAvatar = newAvatarUrl;
          } else {
            const usuario = currentUser as Usuario;
            usuario.fotoPerfil = newAvatarUrl;
            this.userAvatar = newAvatarUrl;
          }
        }
      },
      error: (error: any) => {
        console.error('Error al actualizar avatar:', error);
      }
    });
  }
}
