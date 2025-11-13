import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { CommonModule } from '@angular/common';
import { UserService, UserProfile } from '../../service/userlayout-service';

@Component({
  selector: 'app-private-layout-nutricionista',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './private-layout-nutricionista.html',
  styleUrl: './private-layout-nutricionista.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivateLayoutNutricionista {

  userAvatar: string = '/Images/iconos/iconoSistemas/image 18.png';
  userName: string = 'Nombre Nutricionista';

  private router = inject(Router);
  private userService = inject(UserService);

  citasMenuOpen = signal(false);

  constructor() {
    this.loadUserData();
  }

  toggleCitasMenu(): void {
    this.citasMenuOpen.update(value => !value);
  }

  // ================================================
  //   🔥 CARGAR NOMBRE Y AVATAR DESDE LA BD
  // ================================================
  private loadUserData() {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          this.userName = `${user.nombre} ${user.apellido}`.trim();
          this.userAvatar = user.fotoPerfil ?? '/Images/iconos/iconoSistemas/image 18.png';
        } else {
          this.userService.getCurrentUserProfile().subscribe({
            next: (fetchedUser: UserProfile) => {
              if (fetchedUser) {
                this.userName = `${fetchedUser.nombre} ${fetchedUser.apellido}`.trim() || 'Nombre Nutricionista';
                this.userAvatar = fetchedUser.fotoPerfil ?? '/Images/iconos/iconoSistemas/image 18.png';
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
    const name = localStorage.getItem('userName');
    const avatar = localStorage.getItem('userAvatar');

    this.userName = name || 'Nombre Nutricionista';
    this.userAvatar = avatar || '/Images/iconos/iconoSistemas/image 18.png';
  }

  /**
   * Maneja el evento de clic del botón de salir.
   */
  salir(): void {
    console.log('Cerrando sesión...');

    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userAvatar');
    } catch (e) {
      console.error('Error al limpiar localStorage:', e);
    }

    this.router.navigate(['/inicio']);
  }

}
