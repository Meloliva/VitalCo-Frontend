import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
export class PrivateLayoutNutricionista implements OnInit, OnDestroy {

  userAvatar = signal('/Images/iconos/iconoSistemas/image 18.png');
  userName = signal('Nutricionista');
  citasMenuOpen = signal(false);
  recetasMenuOpen = signal(false);

  private router = inject(Router);
  private nutricionistaService = inject(NutricionistaService);
  private cdr = inject(ChangeDetectorRef);
  @Inject(PLATFORM_ID) private platformId = inject(PLATFORM_ID);

  private avatarListener?: () => void;

  async ngOnInit() {
    await this.cargarDatosUsuario();
    this.setupAvatarListener();
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId) && this.avatarListener) {
      window.removeEventListener('avatarChangedNutricionista', this.avatarListener);
    }
  }

  private setupAvatarListener(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.avatarListener = () => {
        const newAvatar = localStorage.getItem('nutricionistaAvatar');
        if (newAvatar) {
          console.log('📸 Layout: Avatar de nutricionista actualizado');
          this.userAvatar.set(newAvatar);
          this.cdr.markForCheck();
        }
      };
      window.addEventListener('avatarChangedNutricionista', this.avatarListener);
    }
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
      const nombreCompleto = `${data.idusuario?.nombre || ''} ${data.idusuario?.apellido || ''}`.trim();
      this.userName.set(nombreCompleto);

      if (data.idusuario?.fotoPerfil) {
        this.userAvatar.set(data.idusuario.fotoPerfil);
        localStorage.setItem('nutricionistaAvatar', data.idusuario.fotoPerfil);
      }

      console.log('✅ Datos cargados en layout:', nombreCompleto, data.idusuario?.fotoPerfil);

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
    console.log('🚪 Cerrando sesión...');
    try {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.clear();
      }
    } catch (e) {
      console.error('Error al limpiar localStorage:', e);
    }
    this.router.navigate(['/inicio']);
  }
}
