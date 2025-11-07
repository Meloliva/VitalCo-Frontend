import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';

interface PlanSuscripcionDTO {
  id: number;
  tipo: string;
  precio?: number;
  beneficiosPlan?: string;
  terminosCondiciones?: string;
}

interface UsuarioDTO {
  id: number;
}

interface PlanNutricionalDTO {
  id: number;
}

interface PacienteDTO {
  id: number;
  idusuario?: UsuarioDTO;
  altura?: number;
  peso?: number;
  edad?: number;
  idplan?: PlanSuscripcionDTO;
  trigliceridos?: number;
  actividadFisica?: string;
  idPlanNutricional?: PlanNutricionalDTO;
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
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarPlanes();
    this.cargarPaciente();
  }

  cargarPlanes() {
    this.http.get<PlanSuscripcionDTO[]>(`${this.apiUrl}/listarPlanesSuscripcion`).subscribe({
      next: (data) => {
        console.log('📦 Planes recibidos:', data);
        this.planes = (data && data.length > 0) ? data : this.mockPlanes();
      },
      error: (err) => {
        console.error('❌ Error al cargar planes:', err);
        this.planes = this.mockPlanes();
      }
    });
  }

  cargarPaciente() {
    this.http.get<PacienteDTO>(`${this.apiUrl}/pacienteActual`).subscribe({
      next: (p) => {
        console.log('👤 Paciente cargado:', p);
        this.paciente = p;
      },
      error: (err) => {
        console.error('❌ Error al cargar paciente:', err);
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
        console.log('✅ Plan actualizado:', updated);
        this.paciente = updated;
        this.isProcessing = false;
      },
      error: (err) => {
        console.error('❌ Error al cambiar plan:', err);
        this.isProcessing = false;
        this.paciente = this.mockActualizarPlan(plan);
      }
    });
  }

  isPlanActual(plan: PlanSuscripcionDTO) {
    return this.paciente?.idplan?.id === plan.id;
  }

  obtenerFeatures(plan: PlanSuscripcionDTO): string[] {
    if (plan.beneficiosPlan) {
      return plan.beneficiosPlan.split(',').map(b => b.trim());
    }

    if (!plan.precio || plan.precio === 0) {
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
      { id: 1, tipo: 'Inicial', beneficiosPlan: 'Disfruta de todo lo básico', precio: 0 },
      { id: 2, tipo: 'Premium', beneficiosPlan: 'Disfruta de todo el contenido', precio: 49.90 }
    ];
  }

  private mockPaciente(): PacienteDTO {
    return {
      id: 123,
      idplan: { id: 1, tipo: 'Inicial', precio: 0 },
      altura: 1.75,
      peso: 70,
      edad: 30
    };
  }

  private mockActualizarPlan(plan: PlanSuscripcionDTO): PacienteDTO {
    return {
      ...this.paciente!,
      idplan: plan
    };
  }
}
