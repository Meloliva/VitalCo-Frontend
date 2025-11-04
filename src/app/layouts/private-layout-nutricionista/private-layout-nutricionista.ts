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

  // Inyectar el Router para la navegación
  private router = inject(Router);

  // Propiedades del componente
  userName = signal('Nombre Nutricionista');
  logoUrl = signal('https://placehold.co/40x40/22C55E/FFFFFF?text=V&font=sans-serif');

  // --- LÓGICA DEL SUBMENÚ AÑADIDA ---
  citasMenuOpen = signal(false);

  /**
   * Cambia el estado del submenú de citas.
   */
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

