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
  isLoading = false;

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
        this.planFreeId = this.obtenerIdPlanPorTipo('Plan free');
        this.planPremiumId = this.obtenerIdPlanPorTipo('Plan premium');
      },
      error: (error) => console.error('Error al cargar planes:', error)
    });
  }

  obtenerIdPlanPorTipo(tipoPlan: string): number {
    const plan = this.planes.find(p => p.tipo.toLowerCase() === tipoPlan.toLowerCase());
    return plan?.id || 0;
  }

  selectPlan(idPlan: number): void {
    if (idPlan === 0) {
      console.error('ID de plan inválido');
      return;
    }
    this.planSeleccionado = idPlan;
  }

  goBack(): void {
    this.router.navigate(['/nivelactividad']);
  }

  onSubmit(): void {
    if (!this.planSeleccionado || this.planSeleccionado === 0) {
      alert('Por favor selecciona un plan');
      return;
    }
    this.registroShared.guardarPlan(this.planSeleccionado);

    if (!this.registroShared.datosCompletos()) {
      alert('Faltan datos por completar');
      return;
    }

    this.isLoading = true;
    const datosCompletos = this.registroShared.obtenerDatos();

    this.pacienteService.registrarUsuario(datosCompletos.usuarioCompleto!).subscribe({
      next: (usuarioCreado) => {
        const paciente = {
          idusuario: { id: usuarioCreado.id },
          altura: datosCompletos.datosSalud!.altura,
          peso: datosCompletos.datosSalud!.peso,
          edad: datosCompletos.datosSalud!.edad,
          trigliceridos: datosCompletos.datosSalud!.trigliceridos,
          actividadFisica: datosCompletos.nivelActividad!,
          objetivo: datosCompletos.objetivo || '',
          idplan: { id: this.planSeleccionado },
          idPlanNutricional: { id: datosCompletos.idPlanNutricional }
        };

        this.pacienteService.registrarPaciente(paciente).subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/macronutrientes']);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error al registrar paciente:', error);
            alert('Error al completar el registro');
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al registrar usuario:', error);
        alert('Error al registrar usuario');
      }
    });
  }
}
