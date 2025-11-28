import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UserService } from '../../service/userlayout-service';
import { Usuario } from '../../models/usuario.model';
import { Paciente } from '../../models/paciente.model';
import { Nutricionista } from '../../models/nutricionista.model';
import { Subscription } from 'rxjs';
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
  private avatarListener?: () => void;

  constructor(
    private router: Router,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // 1. Carga inicial rápida desde LocalStorage (para que no se vea vacío)
    this.userService.initUserFromStorage();

    // 2. Suscribirse a cambios en los datos del usuario (para actualizar la UI)
    this.loadUserData();

    this.checkRoute();

    // 🟢 NUEVO: Forzar la carga de datos frescos del backend (incluyendo el PLAN)
    // Esto soluciona que 'Citas' no cargue si el localStorage estaba desactualizado.
    this.userService.fetchPerfilAutenticado().subscribe({
      next: (data) => {
        console.log('✅ Datos actualizados desde el servidor en PrivateLayout:', data);
        // No necesitas hacer nada más aquí, porque fetchPerfilAutenticado actualiza
        // el BehaviorSubject y el localStorage automáticamente, lo que disparará
        // el userSubscription de abajo.
      },
      error: (err) => console.error('⚠️ Error al actualizar perfil en inicio:', err)
    });

    if (isPlatformBrowser(this.platformId)) {
      this.avatarListener = () => {
        const newAvatar = localStorage.getItem('userAvatar');
        if (newAvatar) {
          console.log('📸 Sidebar: Avatar actualizado');
          this.userAvatar = newAvatar;
          this.cdr.detectChanges();
        }
      };
      window.addEventListener('avatarChanged', this.avatarListener);
    }

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
    if (isPlatformBrowser(this.platformId) && this.avatarListener) {
      window.removeEventListener('avatarChanged', this.avatarListener);
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

  loadUserData() {
    this.userSubscription = this.userService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          if ('idusuario' in user) {
            const userWithUsuario = user as Paciente | Nutricionista;
            this.userName = `${userWithUsuario.idusuario.nombre} ${userWithUsuario.idusuario.apellido}`;
            this.userAvatar = userWithUsuario.idusuario.fotoPerfil ?? '/Images/iconos/iconoSistemas/image 18.png';
          } else {
            const usuario = user as Usuario;
            this.userName = `${usuario.nombre} ${usuario.apellido}`;
            this.userAvatar = usuario.fotoPerfil ?? '/Images/iconos/iconoSistemas/image 18.png';
          }
          // Esto recalcula si es premium cada vez que llega nueva data
          this.isPremium = this.userService.isPremium();
          this.cdr.detectChanges();
        } else {
          this.loadFromLocalStorage();
        }
      },
      error: () => {
        this.loadFromLocalStorage();
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
