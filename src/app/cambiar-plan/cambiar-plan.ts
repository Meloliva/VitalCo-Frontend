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
      next: (data) => {
        this.planes = (data && data.length > 0) ? data : this.mockPlanes();
      },
      error: () => {
        this.planes = this.mockPlanes();
      }
    });
  }

  cargarPaciente() {
    this.http.get<PacienteDTO>(`${this.apiUrl}/pacienteActual`).subscribe({
      next: (p) => {
        this.paciente = p;
        console.log('Paciente cargado:', p);
      },
      error: (err) => {
        console.error('Error al cargar paciente:', err);
        this.paciente = this.mockPaciente();
      }
    });
  }

  seleccionarPlan(plan: PlanSuscripcionDTO) {
    if (this.isPlanActual(plan) || !this.paciente) return;

    this.isProcessing = true;
    const editarDto: any = {
      id: this.paciente.id,
      idPlan: plan.id
    };

    this.http.put<PacienteDTO>(`${this.apiUrl}/editarPaciente`, editarDto).subscribe({
      next: (updated) => {
        this.paciente = updated;
        this.isProcessing = false;
      },
      error: () => {
        this.isProcessing = false;
        this.paciente = this.mockActualizarPlan(plan);
      }
    });
  }

  isPlanActual(plan: PlanSuscripcionDTO) {
    return this.paciente?.idplan?.id === plan.id;
  }

  obtenerFeatures(plan: PlanSuscripcionDTO): string[] {
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

  private mockPlanes(): PlanSuscripcionDTO[] {
    return [
      { id: 1, nombre: 'Inicial', descripcion: 'Disfruta de todo lo básico', precio: 0 },
      { id: 2, nombre: 'Premium', descripcion: 'Disfruta de todo el contenido', precio: 49.90 }
    ];
  }

  private mockPaciente(): PacienteDTO {
    return {
      id: 123,
      idplan: { id: 1, nombre: 'Inicial', precio: 0 },
      kcalRestantes: 1200
    };
  }

  private mockActualizarPlan(plan: PlanSuscripcionDTO): PacienteDTO {
    return {
      ...this.paciente!,
      idplan: plan
    };
  }
}
