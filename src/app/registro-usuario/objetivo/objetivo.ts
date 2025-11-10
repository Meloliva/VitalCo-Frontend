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

    const [objetivoTexto, meses] = this.objetivoSeleccionado.split('-');
    const duracionBuscada = `${meses} meses`;

    const normalizar = (texto: string) => texto.toLowerCase().trim().replace(/\s+/g, ' ');

    const planEncontrado = this.planesNutricionales.find(plan => {
      const objetivoNormalizado = normalizar(plan.objetivo || '');
      const duracionNormalizada = normalizar(plan.duracion || '');
      const buscarObjetivo = normalizar(objetivoTexto === 'bajar' ? 'bajar trigliceridos' : 'mantener tu salud');
      const buscarDuracion = normalizar(duracionBuscada);

      return objetivoNormalizado === buscarObjetivo && duracionNormalizada === buscarDuracion;
    });

    if (!planEncontrado || !planEncontrado.id) {
      alert('No se encontró un plan nutricional que coincida.');
      return;
    }

    // ✅ Solo guardar el plan nutricional (que ya incluye el objetivo)
    this.registroShared.guardarPlanNutricional(planEncontrado.id);

    console.log('📊 Plan nutricional guardado:', planEncontrado);
    console.log('✅ Datos completos:', this.registroShared.obtenerDatos());

    this.router.navigate(['/nivelactividad']);
  }


  goBack(): void {
    this.router.navigate(['/datos-salud']);
  }
}
