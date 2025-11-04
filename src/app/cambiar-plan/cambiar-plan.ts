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
  isProcessing = false;
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarPaciente();
    this.cargarPlanes();
  }

  cargarPlanes() {
    this.http.get<PlanSuscripcionDTO[]>(`${this.apiUrl}/listarPlanes`).subscribe({
      next: (data) => {
        this.planes = data && data.length > 0 ? data : this.getFallbackPlanes();
      },
      error: () => {
        this.planes = this.getFallbackPlanes();
      }
    });
  }

  cargarPaciente() {
    this.http.get<PacienteDTO>(`${this.apiUrl}/pacienteActual`).subscribe({
      next: (p) => {
        this.paciente = p;
        console.log('Paciente cargado:', this.paciente);
      },
      error: (err) => {
        console.error('Error cargando paciente', err);
        this.paciente = {
          id: 1,
          idplan: { id: 1, nombre: 'Inicial', precio: 0 }
        };
      }
    });
  }

  getFallbackPlanes(): PlanSuscripcionDTO[] {
    return [
      { id: 1, nombre: 'Inicial', descripcion: 'Disfruta de todo lo básico', precio: 0 },
      { id: 2, nombre: 'Premium', descripcion: 'Disfruta de todo el contenido', precio: 49.9 }
    ];
  }

  esPlanActual(plan: PlanSuscripcionDTO): boolean {
    return !!(this.paciente?.idplan?.id === plan.id);
  }

  cambiarAPlan(plan: PlanSuscripcionDTO) {
    if (!this.paciente || this.esPlanActual(plan)) return;
    this.isProcessing = true;
    const editarDto = { id: this.paciente.id, idPlan: plan.id };
    this.http.put<PacienteDTO>(`${this.apiUrl}/editarPaciente`, editarDto).subscribe({
      next: (updated) => {
        this.paciente = updated;
        this.isProcessing = false;
        alert('Plan actualizado correctamente.');
      },
      error: () => {
        this.isProcessing = false;
        alert('No se pudo cambiar el plan.');
      }
    });
  }
}
