import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PacienteService, PlanSuscripcionDTO } from '../../service/paciente.service';
import { RegistroSharedService } from '../../service/registro-shared.service';

@Component({
  selector: 'app-escoger-plan',
  standalone: true,
  templateUrl: './escoger-plan.html',
  styleUrls: ['./escoger-plan.css'],
  imports: [CommonModule, MatProgressBarModule]
})
export class EscogerPlanComponent implements OnInit {
  progressValue = 0;
  planes: PlanSuscripcionDTO[] = [];
  planSeleccionado: number = 0;

  // ✅ Cachear los IDs de los planes
  planFreeId: number = 0;
  planPremiumId: number = 0;

  constructor(
    private router: Router,
    private pacienteService: PacienteService,
    private registroShared: RegistroSharedService
  ) {}

  ngOnInit(): void {
    this.registroShared.progress$.subscribe(progress => this.progressValue = progress);
    this.cargarPlanes();
  }

  cargarPlanes(): void {
    this.pacienteService.listarPlanesSuscripcion().subscribe({
      next: (planes) => {
        this.planes = planes;
        console.log('Planes cargados:', planes);

        // ✅ Guardar los IDs de los planes
        this.planFreeId = this.obtenerIdPlanPorTipo('Plan free');
        this.planPremiumId = this.obtenerIdPlanPorTipo('Plan premium');

        console.log('Plan Free ID:', this.planFreeId);
        console.log('Plan Premium ID:', this.planPremiumId);
      },
      error: (error) => console.error('Error al cargar planes:', error)
    });
  }

  obtenerIdPlanPorTipo(tipoPlan: string): number {
    const plan = this.planes.find(p =>
      p.tipo.toLowerCase() === tipoPlan.toLowerCase()
    );
    return plan?.id || 0;
  }

  selectPlan(idPlan: number): void {
    if (idPlan === 0) {
      console.error('ID de plan inválido');
      return;
    }
    this.planSeleccionado = idPlan;
    console.log('Plan seleccionado:', idPlan);
  }

  goBack(): void {
    this.router.navigate(['/nivel-actividad']);
  }

  onSubmit(): void {
    if (!this.planSeleccionado || this.planSeleccionado === 0) {
      alert('Por favor selecciona un plan');
      return;
    }

    this.registroShared.guardarPlan(this.planSeleccionado);
    this.router.navigate(['/macronutrientes']);
  }
}
