import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router"; // Router inyectado
import { CommonModule } from '@angular/common';

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
  citasMenuOpen = signal(false);
  toggleCitasMenu(): void {
    this.citasMenuOpen.update(value => !value);
  }

  /**
   * Maneja el evento de clic del botón de salir.
   */
  salir(): void {
    console.log('Cerrando sesión...');

    // Lógica real de logout
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userAvatar');
    } catch (e) {
      console.error('Error al limpiar localStorage:', e);
    }

    // Redirigir a la página de inicio
    this.router.navigate(['/inicio']);
  }

}

