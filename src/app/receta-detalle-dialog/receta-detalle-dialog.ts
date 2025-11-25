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
    return !!(
      this.data.calorias ||
      this.data.proteinas ||
      this.data.carbohidratos ||
      this.data.grasas
    );
  }

  tieneDetalles(): boolean {
    return !!(
      this.data.descripcion ||
      this.data.ingredientes ||
      this.data.preparacion ||
      this.tieneInfoNutricional()
    );
  }

  puedeAgregarAProgreso(): boolean {
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

        setTimeout(() => {
          this.cerrar(true);
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

  obtenerIngredientesArray(): string[] {
    if (!this.data.ingredientes) {
      return [];
    }

    const ingredientes = this.data.ingredientes
      .split(/[\n,;]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);

    return ingredientes;
  }

  obtenerPreparacionArray(): string[] {
    if (!this.data.preparacion) {
      return [];
    }

    // Separar por números seguidos de punto (1., 2., 3., etc.) o saltos de línea
    let pasos = this.data.preparacion
      .split(/(?:\d+\.\s*|\n)+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);

    // Si no se encontraron separadores numéricos, intentar separar por punto seguido de espacio
    if (pasos.length === 1) {
      pasos = this.data.preparacion
        .split(/\.\s+/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }

    return pasos;
  }
}
