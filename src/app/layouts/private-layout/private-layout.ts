import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UserService, UserProfile } from '../../service/userlayout-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './private-layout.html',
  styleUrl: './private-layout.css',
})
export class PrivateLayout implements OnInit, OnDestroy {
  userAvatar: string = '/Images/iconos/iconoSistemas/image 18.png';
  userName: string = 'Nombre de Usuario';
  isPremium: boolean = false;
  private userSubscription?: Subscription;

  constructor(
    private router: Router,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Carga el usuario desde storage (solo navegador)
    this.userService.initUserFromStorage();
    this.loadUserData();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
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
    if (isPlatformBrowser(this.platformId)) {
      this.userService.clearUser();
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
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
