import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RecetaPacienteService } from '../service/receta-paciente.service';

interface RecetaDetalle {
  id: number;
  nombre: string;
  descripcion?: string;
  horario?: string;
  tiempo?: number;
  calorias?: number;
  proteinas?: number;
  carbohidratos?: number;
  grasas?: number;
  ingredientes?: string;
  preparacion?: string;
  cantidadPorcion?: number;
  foto?: string;
  idPlanReceta?: number;
  idPlanRecetaReceta?: number;
}

@Component({
  selector: 'app-receta-detalle-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './receta-detalle-dialog.html',
  styleUrls: ['./receta-detalle-dialog.css']
})
export class RecetaDetalleDialogComponent {
  agregando = false;
  mostrarExito = false;
  mensajeError = '';

  constructor(
    public dialogRef: MatDialogRef<RecetaDetalleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RecetaDetalle,
    private recetaService: RecetaPacienteService
  ) {
    console.log('Datos de receta recibidos:', data);
  }

  cerrar(actualizado: boolean = false): void {
    this.dialogRef.close(actualizado);
  }

  tieneInfoNutricional(): boolean {
    return !!(this.data.calorias || this.data.proteinas ||
      this.data.carbohidratos || this.data.grasas);
  }

  tieneDetalles(): boolean {
    return !!(this.data.descripcion || this.data.ingredientes ||
      this.data.preparacion || this.tieneInfoNutricional());
  }

  puedeAgregarAProgreso(): boolean {
    // Verificar que tengamos el ID necesario para agregar a progreso
    return !!this.data.idPlanRecetaReceta;
  }

  agregarAProgreso(): void {
    if (!this.data.idPlanRecetaReceta) {
      this.mensajeError = 'No se puede agregar esta receta al progreso en este momento.';
      console.error('Falta idPlanRecetaReceta:', this.data);
      return;
    }

    this.agregando = true;
    this.mensajeError = '';
    this.mostrarExito = false;

    console.log('Agregando receta a progreso:', {
      idPlanRecetaReceta: this.data.idPlanRecetaReceta,
      nombre: this.data.nombre
    });

    this.recetaService.agregarProgreso(this.data.idPlanRecetaReceta).subscribe({
      next: (response) => {
        console.log('Receta agregada exitosamente:', response);
        this.agregando = false;
        this.mostrarExito = true;

        // Cerrar el modal después de 2 segundos y notificar que se actualizó
        setTimeout(() => {
          this.cerrar(true); // ✅ Pasar true para indicar que hubo cambios
        }, 2000);
      },
      error: (error) => {
        console.error('Error al agregar receta a progreso:', error);
        this.agregando = false;

        if (error.status === 400) {
          this.mensajeError = error.error?.message || 'La receta excede los valores nutricionales permitidos.';
        } else if (error.status === 404) {
          this.mensajeError = 'No se encontró la receta o el plan.';
        } else {
          this.mensajeError = 'Error al agregar la receta. Por favor, intenta nuevamente.';
        }
      }
    });
  }

  formatearPreparacion(preparacion: string): string {
    if (!preparacion) return '';

    if (preparacion.includes('<ol>') || preparacion.includes('<li>')) {
      return preparacion;
    }

    const lineas = preparacion.split('\n').filter(l => l.trim());
    if (lineas.some(l => /^\d+\./.test(l.trim()))) {
      const items = lineas.map(l => {
        const texto = l.replace(/^\d+\.\s*/, '');
        return `<li>${texto}</li>`;
      }).join('');
      return `<ol>${items}</ol>`;
    }

    return preparacion.split('\n')
      .filter(l => l.trim())
      .map(l => `<p>${l}</p>`)
      .join('');
  }
}
