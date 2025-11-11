import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import {Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd} from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UserService, UserProfile } from '../../service/userlayout-service';
import { Subscription } from 'rxjs';
import {filter} from 'rxjs/operators';

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
  private userSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.userService.initUserFromStorage();
    this.loadUserData();
    this.checkRoute();

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkRoute();
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

  loadUserData() {
    this.userSubscription = this.userService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          this.userName = `${user.nombre} ${user.apellido}`;
          this.userAvatar = user.fotoPerfil ?? '/Images/iconos/iconoSistemas/image 18.png';
          this.isPremium = this.userService.isPremium();
        } else {
          this.userService.getCurrentUserProfile().subscribe({
            next: (fetchedUser: UserProfile) => {
              if (fetchedUser) {
                this.userName = `${fetchedUser.nombre} ${fetchedUser.apellido}`.trim() || 'Nombre de Usuario';
                this.userAvatar = fetchedUser.fotoPerfil ?? '/Images/iconos/iconoSistemas/image 18.png';
                this.isPremium = this.userService.isPremium();
              } else {
                this.loadFromLocalStorage();
              }
            },
            error: () => {
              this.loadFromLocalStorage();
            }
          });
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

    this.isPremium = userPlan === 'premium';
    this.userName = userName || 'Nombre de Usuario';
    this.userAvatar = userAvatar || '/Images/iconos/iconoSistemas/image 18.png';
  }

  logout() {
    console.log('🚪 Cerrando sesión...'); // 👈 para probar
    if (isPlatformBrowser(this.platformId)) {
      this.userService.clearUser();
      localStorage.removeItem('token');
    }
    this.router.navigate(['/inicio']);

  }

  updateUserAvatar(newAvatarUrl: string) {
    this.userService.updateAvatar(newAvatarUrl).subscribe({
      next: (user: UserProfile) => {
        this.userAvatar = user.fotoPerfil || '/Images/iconos/iconoSistemas/image 18.png';
      },
      error: (error: any) => {
        console.error('Error al actualizar avatar:', error);
      }
    });
  }
}
