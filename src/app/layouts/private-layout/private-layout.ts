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
  userType: 'paciente' | 'nutricionista' = 'paciente'; // 👈 tipo de usuario
  private userSubscription?: Subscription;

  constructor(
    private router: Router,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.userService.initUserFromStorage();
    this.loadUserData();

    // Verificamos tipo de usuario guardado
    if (isPlatformBrowser(this.platformId)) {
      const tipo = localStorage.getItem('userType');
      if (tipo === 'nutricionista') this.userType = 'nutricionista';
    }
  }

  ngOnDestroy() {
    if (this.userSubscription) this.userSubscription.unsubscribe();
  }

  loadUserData() {
    this.userSubscription = this.userService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          this.userName = `${user.nombre} ${user.apellido}`;
          this.userAvatar = user.fotoPerfil ?? '/Images/iconos/iconoSistemas/image 18.png';
          this.isPremium = this.userService.isPremium();
        } else {
          this.loadFromLocalStorage();
        }
      },
      error: () => this.loadFromLocalStorage(),
    });
  }

  private loadFromLocalStorage() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.isPremium = localStorage.getItem('userPlan') === 'premium';
    this.userName = localStorage.getItem('userName') || 'Nombre de Usuario';
    this.userAvatar = localStorage.getItem('userAvatar') || '/Images/iconos/iconoSistemas/image 18.png';
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      this.userService.clearUser();
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
    }
    this.router.navigate(['/iniciarsesion']);
  }
}
