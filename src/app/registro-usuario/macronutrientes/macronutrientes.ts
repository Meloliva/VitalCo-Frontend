import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PacienteService, PlanNutricionalDTO } from '../../service/paciente.service';
import { RegistroSharedService } from '../../service/registro-shared.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-macronutrientes',
  standalone: true,
  templateUrl: './macronutrientes.html',
  styleUrls: ['./macronutrientes.css'],
  imports: [CommonModule, MatProgressBarModule]
})
export class MacronutrientesComponent implements OnInit, AfterViewInit {
  progressValue = 0;
  planesNutricionales: PlanNutricionalDTO[] = [];

  caloriasCalculadas: number = 2000;
  mesesObjetivo: number = 3;
  proteinas: number = 150;
  carbohidratos: number = 250;
  grasas: number = 60;

  constructor(
    private router: Router,
    private pacienteService: PacienteService,
    private registroShared: RegistroSharedService
  ) {}

  ngOnInit(): void {
    this.registroShared.progress$.subscribe(progress => this.progressValue = progress);
    this.cargarPlanesNutricionales();
  }

  ngAfterViewInit(): void {
    this.crearGraficoMacros();
  }

  cargarPlanesNutricionales(): void {
    this.pacienteService.listarPlanesNutricionales().subscribe({
      next: (planes) => {
        this.planesNutricionales = planes;
        this.calcularMacronutrientes();
      },
      error: (error) => console.error('Error al cargar planes nutricionales:', error)
    });
  }

  private calcularMacronutrientes(): void {
    const datos = this.registroShared.obtenerDatos();

    if (datos.datosSalud && datos.nivelActividad && datos.idPlanNutricional) {
      const { peso, altura, edad } = datos.datosSalud;
      let tmb = 10 * peso + 6.25 * (altura * 100) - 5 * edad + 5;

      const factorActividad: { [key: string]: number } = {
        'sedentario': 1.2,
        'ligero': 1.375,
        'moderado': 1.55,
        'activo': 1.725,
        'muy_activo': 1.9
      };

      const nivelNormalizado = datos.nivelActividad.toLowerCase().replace(/\s+/g, '_');
      tmb *= factorActividad[nivelNormalizado] || 1.375;

      const planNutricional = this.planesNutricionales.find(p => p.id === datos.idPlanNutricional);
      const objetivo = planNutricional?.objetivo?.toLowerCase() || '';

      if (objetivo.includes('bajar') || objetivo.includes('perder')) {
        this.caloriasCalculadas = Math.round(tmb - 500);
        this.mesesObjetivo = 3;
      } else if (objetivo.includes('aumentar') || objetivo.includes('subir')) {
        this.caloriasCalculadas = Math.round(tmb + 500);
        this.mesesObjetivo = 3;
      } else {
        this.caloriasCalculadas = Math.round(tmb);
        this.mesesObjetivo = 2;
      }

      this.proteinas = Math.round((this.caloriasCalculadas * 0.30) / 4);
      this.carbohidratos = Math.round((this.caloriasCalculadas * 0.40) / 4);
      this.grasas = Math.round((this.caloriasCalculadas * 0.30) / 9);
    }
  }

  private crearGraficoMacros(): void {
    const canvas = document.getElementById('macrosChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('❌ Canvas no encontrado');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ No se pudo obtener el contexto del canvas');
      return;
    }

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Proteínas', 'Carbohidratos', 'Grasas'],
        datasets: [{
          data: [this.proteinas, this.carbohidratos, this.grasas],
          backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/escoger-plan']);
  }

  finalizarRegistro(): void {
    this.registroShared.limpiarDatos();
    alert('¡Registro completado exitosamente!');
    this.router.navigate(['/iniciarsesion']);
  }
}
