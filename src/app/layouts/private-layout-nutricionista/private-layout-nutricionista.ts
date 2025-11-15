import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NutricionistaService } from '../../service/nutricionista.service';
import { firstValueFrom } from 'rxjs';

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
export class PrivateLayoutNutricionista implements OnInit {

  userAvatar: string = '/Images/iconos/iconoSistemas/image 18.png';
  userName: string = 'Nutricionista';
  citasMenuOpen = signal(false);
  recetasMenuOpen = signal(false);

  private router = inject(Router);
  private nutricionistaService = inject(NutricionistaService);

  async ngOnInit() {
    await this.cargarDatosUsuario();
  }

  async cargarDatosUsuario() {
    try {
      // ✅ 1️⃣ Obtener el usuario autenticado según el token
      const usuario = await firstValueFrom(this.nutricionistaService.obtenerDatosNutricionista());
      if (!usuario?.id) return;

      // ✅ 2️⃣ Obtener los datos completos del nutricionista
      const data = await firstValueFrom(
        this.nutricionistaService.obtenerNutricionistaPorUsuario(usuario.id)
      );

      // ✅ 3️⃣ Mostrar el nombre y la foto en el layout
      this.userName = `${data.idusuario?.nombre || ''} ${data.idusuario?.apellido || ''}`.trim();
      if (data.idusuario?.fotoPerfil) {
        this.userAvatar = data.idusuario.fotoPerfil;
      }

      console.log('✅ Datos cargados en layout:', this.userName, this.userAvatar);

    } catch (err) {
      console.error('❌ Error al cargar datos del nutricionista en layout:', err);
    }
  }

  toggleCitasMenu(): void {
    this.citasMenuOpen.update(value => !value);
  }
  toggleRecetasMenu(): void {
    this.recetasMenuOpen.update(value => !value);
  }

  salir(): void {
    console.log('Cerrando sesión...');
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Error al limpiar localStorage:', e);
    }
    this.router.navigate(['/inicio']);
  }

  protected readonly removeEventListener = removeEventListener;
}
