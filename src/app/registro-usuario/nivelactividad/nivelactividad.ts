import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-nivel-actividad',
  standalone: true,
  templateUrl: './nivelactividad.html',
  styleUrls: ['./nivelactividad.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatProgressBarModule
  ]
})
export class NivelActividadComponent {
  // Valor de la barra de progreso (ajusta según el paso)
  progressValue: number = 60;

  // Nivel seleccionado por el usuario
  nivelSeleccionado: string = '';

  constructor(private router: Router) {}

  // CORREGIDO: Ahora SÍ actualiza la variable nivelSeleccionado
  selectNivel(nivel: string): void {
    this.nivelSeleccionado = nivel; // ← ESTA LÍNEA FALTABA
    console.log('Nivel de actividad seleccionado:', this.nivelSeleccionado);
  }

  // Navega a la pantalla anterior
  goBack(): void {
    this.router.navigate(['/objetivo']);
  }

  // Valida y navega al siguiente paso
  onSubmit(): void {
    if (!this.nivelSeleccionado) {
      alert('Por favor selecciona tu nivel de actividad');
      return;
    }

    // Guardar en localStorage o servicio si deseas
    localStorage.setItem('nivelActividad', this.nivelSeleccionado);

    // Navegar a la siguiente pantalla
    this.router.navigate(['/plan']); // Ajusta según tu flujo
  }
}
