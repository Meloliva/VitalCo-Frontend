// typescript
// File: `src/app/cambiar-plan/cambiar-plan.ts`
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';

interface PlanSuscripcionDTO {
  id: number;
  nombre: string;
  descripcion?: string;
  precio?: number;
}

interface PacienteDTO {
  id: number;
  idplan?: PlanSuscripcionDTO;
  kcalRestantes?: number;
  // otros campos opcionales...
}

@Component({
  selector: 'app-cambiar-plan',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './cambiar-plan.html',
  styleUrls: ['./cambiar-plan.css']
})
export class CambiarPlan implements OnInit {
  planes: PlanSuscripcionDTO[] = [];
  paciente?: PacienteDTO;
  seleccionadoId?: number;
  isProcessing = false;
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarPlanes();
    this.cargarPaciente();
  }

  cargarPlanes() {
    // Ajusta endpoint real si es otro
    this.http.get<PlanSuscripcionDTO[]>(`${this.apiUrl}/listarPlanes`).subscribe({
      next: (data) => this.planes = data || [],
      error: (err) => {
        console.error('No se pudo cargar planes', err);
        this.planes = [];
      }
    });
  }

  cargarPaciente() {
    // Endpoint de ejemplo para obtener datos del paciente autenticado.
    // Cambia por el endpoint real (por ejemplo: /api/mis-datos, /api/paciente/me, etc.)
    this.http.get<PacienteDTO>(`${this.apiUrl}/pacienteActual`).subscribe({
      next: (p) => this.paciente = p,
      error: (err) => {
        console.error('No se pudo cargar paciente', err);
        // fallback: si no existe, puede cargarse por otro endpoint o requerir login
      }
    });
  }

  seleccionarPlan(plan: PlanSuscripcionDTO) {
    this.seleccionadoId = plan.id;
  }

  cancelarSeleccion() {
    this.seleccionadoId = undefined;
  }

  confirmarCambio() {
    if (!this.paciente || !this.seleccionadoId) return;
    this.isProcessing = true;

    const editarDto: any = {
      id: this.paciente.id,
      idPlan: this.seleccionadoId
      // incluye otros campos requeridos por tu EditarPacienteDTO si aplica
    };

    this.http.put<PacienteDTO>(`${this.apiUrl}/editarPaciente`, editarDto).subscribe({
      next: (updated) => {
        this.paciente = updated;
        this.seleccionadoId = undefined;
        this.isProcessing = false;
        alert('Plan actualizado correctamente.');
      },
      error: (err) => {
        console.error('Error actualizando plan', err);
        this.isProcessing = false;
        alert('No se pudo cambiar el plan. Revisa la consola.');
      }
    });
  }
}

