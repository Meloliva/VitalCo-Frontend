// typescript
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
  metodosPago = ['visa', 'mastercard', 'amex', 'paypal'];
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarPlanes();
    this.cargarPaciente();
  }

  cargarPlanes() {
    this.http.get<PlanSuscripcionDTO[]>(`${this.apiUrl}/listarPlanes`).subscribe({
      next: (data) => this.planes = data || this.mockPlanes(),
      error: () => this.planes = this.mockPlanes()
    });
  }

  cargarPaciente() {
    this.http.get<PacienteDTO>(`${this.apiUrl}/pacienteActual`).subscribe({
      next: (p) => this.paciente = p,
      error: () => this.paciente = this.mockPaciente()
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
    const editarDto: any = { id: this.paciente.id, idPlan: this.seleccionadoId };
    this.http.put<PacienteDTO>(`${this.apiUrl}/editarPaciente`, editarDto).subscribe({
      next: (updated) => {
        this.paciente = updated;
        this.seleccionadoId = undefined;
        this.isProcessing = false;
        alert('Plan actualizado correctamente.');
      },
      error: () => {
        this.isProcessing = false;
        alert('No se pudo cambiar el plan. Revisa la consola.');
      }
    });
  }

  isPlanActual(plan: PlanSuscripcionDTO) {
    return this.paciente?.idplan?.id === plan.id;
  }

  obtenerFeatures(plan: PlanSuscripcionDTO): string[] {
    // ejemplo simple; adapta según el backend
    if (!plan.precio) {
      return [
        'Recetas básicas para triglicéridos.',
        'Registro manual de alimentos.',
        'Gráfica simple de progreso.'
      ];
    }
    return [
      'Todo el plan free.',
      'Consultas virtuales con nutricionistas.',
      'Recetas exclusivas y personalizadas.',
      'Soporte personalizado.',
      'Gráfica simple del progreso.'
    ];
  }

  // mocks para desarrollo local si el API no responde
  private mockPlanes(): PlanSuscripcionDTO[] {
    return [
      { id: 1, nombre: 'Inicial', descripcion: 'Disfruta de todo lo básico', precio: 0 },
      { id: 2, nombre: 'Premium', descripcion: 'Disfruta de todo el contenido', precio: 49.90 }
    ];
  }

  private mockPaciente(): PacienteDTO {
    return { id: 123, idplan: { id: 1, nombre: 'Inicial' }, kcalRestantes: 1200 };
  }
}
