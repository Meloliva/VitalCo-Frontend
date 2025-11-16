import { Component, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SeguimientoService, SeguimientoResumenDTO } from '../service/seguimiento.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-consultar',
  standalone: true,
  templateUrl: './consultar.html',
  imports: [FormsModule, CommonModule],
  styleUrls: ['./consultar.css']
})
export class Consultar implements AfterViewInit, OnDestroy {
  fechaConsulta: string = '';
  dni: string = '';
  private chart: any;
  private chartInitialized: boolean = false;

  resumenCargado: boolean = false;
  errorMensaje: string = '';
  cargando: boolean = false;
  nombrePaciente: string = '';

  datosNutricionales: any = null;

  constructor(
    private router: Router,
    private seguimientoService: SeguimientoService,
    private cdr: ChangeDetectorRef  // ✅ AGREGAR ESTO
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.inicializarGraficoVacio();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  inicializarGraficoVacio(): void {
    const canvas = document.getElementById('grafico-consulta') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas no encontrado');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Contexto del canvas no disponible');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Proteínas', 'Grasas', 'Carbohidratos'],
        datasets: [
          {
            label: 'Consumido (g)',
            data: [0, 0, 0],
            backgroundColor: '#4CAF50',
            borderRadius: 6
          },
          {
            label: 'Requerido (g)',
            data: [0, 0, 0],
            backgroundColor: '#FF9800',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Esperando búsqueda...',
            font: {
              size: 16
            }
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Gramos (g)'
            }
          }
        }
      }
    });

    this.chartInitialized = true;
  }

  actualizarGrafico(datos: SeguimientoResumenDTO): void {
    if (!this.chartInitialized) {
      console.warn('Gráfico no inicializado, inicializando...');
      this.inicializarGraficoVacio();
    }

    if (!this.chart) {
      console.error('Chart no está disponible');
      return;
    }

    const totales = datos.totalesNutricionales;

    this.chart.data.datasets[0].data = [
      totales.proteinas,
      totales.grasas,
      totales.carbohidratos
    ];

    this.chart.data.datasets[1].data = [
      totales.requerido_proteinas,
      totales.requerido_grasas,
      totales.requerido_carbohidratos
    ];

    this.chart.options.plugins.title.text = `Reporte de ${datos.nombrePaciente}`;

    this.chart.update();
  }

  buscar(event: Event): void {
    event.preventDefault();

    // Validación
    if (!this.dni || !this.fechaConsulta) {
      this.errorMensaje = 'Ingrese DNI y fecha válidos';
      this.resumenCargado = false;
      this.cdr.detectChanges();  // ✅ Forzar actualización
      return;
    }

    // Resetear estados
    this.errorMensaje = '';
    this.cargando = true;
    this.resumenCargado = false;
    this.datosNutricionales = null;
    this.cdr.detectChanges();  // ✅ Mostrar estado de carga inmediatamente

    // Llamada real al backend
    this.seguimientoService.obtenerResumenPorDniYFecha(this.dni, this.fechaConsulta)
      .subscribe({
        next: (resumen) => {
          console.log('Datos recibidos:', resumen);

          // ✅ Verificar si hay datos vacíos
          if (!resumen || !resumen.totalesNutricionales) {
            this.errorMensaje = 'No se encontraron datos para este DNI y fecha.';
            this.cargando = false;
            this.resumenCargado = false;
            this.datosNutricionales = null;
            this.inicializarGraficoVacio();
            this.cdr.detectChanges();
            return;
          }

          // ✅ Asignar datos
          this.datosNutricionales = resumen;
          this.nombrePaciente = resumen.nombrePaciente;
          this.resumenCargado = true;
          this.cargando = false;

          // ✅ Actualizar gráfico
          this.actualizarGrafico(resumen);

          // ✅ FORZAR detección de cambios
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al obtener datos:', error);

          this.errorMensaje = error.error?.message || 'Error al obtener los datos. Verifique DNI y fecha.';
          this.cargando = false;
          this.resumenCargado = false;
          this.datosNutricionales = null;

          this.inicializarGraficoVacio();

          // ✅ FORZAR detección de cambios
          this.cdr.detectChanges();
        }
      });
  }

  calcularPorcentaje(consumido: number, requerido: number): number {
    if (!requerido || requerido === 0) return 0;
    return Math.round((consumido / requerido) * 100);
  }

  limpiarBusqueda(): void {
    this.dni = '';
    this.fechaConsulta = '';
    this.datosNutricionales = null;
    this.nombrePaciente = '';
    this.resumenCargado = false;
    this.errorMensaje = '';
    this.cargando = false;

    this.inicializarGraficoVacio();

    // ✅ FORZAR detección de cambios
    this.cdr.detectChanges();
  }
}
