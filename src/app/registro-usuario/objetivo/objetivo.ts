import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PacienteService, PlanNutricionalDTO } from '../../service/paciente.service';
import { RegistroSharedService } from '../../service/registro-shared.service';

@Component({
  selector: 'app-objetivo',
  standalone: true,
  templateUrl: './objetivo.html',
  styleUrls: ['./objetivo.css'],
  imports: [CommonModule, FormsModule, MatProgressBarModule]
})
export class ObjetivoComponent implements OnInit {
  objetivoSeleccionado: string = '';
  planesNutricionales: PlanNutricionalDTO[] = [];
  progressValue: number = 0;

  constructor(
    private router: Router,
    private pacienteService: PacienteService,
    private registroShared: RegistroSharedService
  ) {}

  ngOnInit(): void {
    this.cargarPlanesNutricionales();
    this.progressValue = this.registroShared.obtenerProgreso();
  }

  cargarPlanesNutricionales(): void {
    this.pacienteService.listarPlanesNutricionales().subscribe({
      next: (planes) => {
        this.planesNutricionales = planes;
        console.log('Planes cargados:', planes);
      },
      error: (error) => console.error('Error al cargar planes:', error)
    });
  }

  onSelectChange(): void {
    console.log('Objetivo seleccionado:', this.objetivoSeleccionado);

  }

  onSubmit(): void {
    if (!this.objetivoSeleccionado) {
      alert('Por favor selecciona un objetivo');
      return;
    }

    // Extraemos los valores seleccionados
    const [objetivoTexto, duracion] = this.objetivoSeleccionado.split(' - ');

    const planEncontrado = this.planesNutricionales.find(plan =>
      plan.objetivo.trim().toLowerCase() === objetivoTexto.trim().toLowerCase() &&
      plan.duracion.trim().toLowerCase() === duracion.trim().toLowerCase()
    );

    if (!planEncontrado || !planEncontrado.id) {
      alert('No se encontró un plan nutricional que coincida.');
      return;
    }

    // Guardamos solo el ID del plan
    this.registroShared.guardarPlanNutricional(planEncontrado.id);

    console.log('📊 Plan nutricional guardado:', planEncontrado);
    this.router.navigate(['/nivelactividad']);
  }

  goBack(): void {
    this.router.navigate(['/datos-salud']);
  }
}
