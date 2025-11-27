import { Component, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  SeguimientoService,
  VerificarCumplimientoResponse
} from '../service/seguimiento.service';
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

  datosNutricionales: VerificarCumplimientoResponse | null = null;

  porcentajeCumplimiento: number = 0;

  constructor(
    private router: Router,
    private seguimientoService: SeguimientoService,
    private cdr: ChangeDetectorRef
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
      this.chartInitialized = false;
    }
  }

  inicializarGraficoVacio(): void {
    const canvas = document.getElementById('grafico-consulta') as HTMLCanvasElement;
    if (!canvas) {
      console.error('❌ Canvas no encontrado - El elemento debe estar siempre en el DOM');
      setTimeout(() => {
        const retryCanvas = document.getElementById('grafico-consulta') as HTMLCanvasElement;
        if (retryCanvas) {
          console.log('✅ Canvas encontrado en reintento');
          this.crearGrafico(retryCanvas);
        }
      }, 200);
      return;
    }

    console.log('✅ Canvas encontrado:', canvas);
    this.crearGrafico(canvas);
  }

  private crearGrafico(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ Contexto del canvas no disponible');
      return;
    }

    console.log('✅ Contexto obtenido');

    if (this.chart) {
      console.log('🔄 Destruyendo gráfico anterior');
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Cumplido', 'Por Cumplir'],
        datasets: [{
          data: [0, 100],
          backgroundColor: ['#00BF61', '#E0E0E0'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Esperando búsqueda...',
            font: {
              size: 18,
              weight: 'bold',
              family: 'Poppins'
            },
            padding: 20,
            color: '#333'
          },
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              font: {
                size: 14,
                family: 'Poppins'
              },
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              size: 14,
              family: 'Poppins'
            },
            bodyFont: {
              size: 13,
              family: 'Poppins'
            },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                return `${label}: ${value.toFixed(1)}%`;
              }
            }
          }
        },
        cutout: '65%',
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    });

    this.chartInitialized = true;
    console.log('✅ Gráfico inicializado correctamente');
  }

  actualizarGrafico(porcentaje: number, nombrePaciente: string): void {
    if (!this.chartInitialized || !this.chart) {
      console.warn('⚠️ Gráfico no inicializado, inicializando ahora...');
      this.inicializarGraficoVacio();

      setTimeout(() => {
        if (this.chart) {
          this.actualizarGrafico(porcentaje, nombrePaciente);
        }
      }, 300);
      return;
    }

    const cumplido = Math.min(Math.max(porcentaje, 0), 100);
    const porCumplir = 100 - cumplido;

    console.log('📊 Actualizando gráfico:', { cumplido, porCumplir });

    this.chart.data.datasets[0].data = [cumplido, porCumplir];
    this.chart.options.plugins.title.text = `Cumplimiento: ${nombrePaciente} (${cumplido.toFixed(1)}%)`;

    this.chart.update('active');
    console.log('✅ Gráfico actualizado');
  }

  buscar(event: Event): void {
    event.preventDefault();

    if (!this.dni || !this.fechaConsulta) {
      this.errorMensaje = 'Ingrese DNI y fecha válidos';
      this.resumenCargado = false;
      this.cdr.detectChanges();
      return;
    }

    if (!/^\d{8}$/.test(this.dni)) {
      this.errorMensaje = 'El DNI debe tener exactamente 8 dígitos';
      this.resumenCargado = false;
      this.cdr.detectChanges();
      return;
    }

    this.errorMensaje = '';
    this.cargando = true;
    this.resumenCargado = false;
    this.datosNutricionales = null;
    this.cdr.detectChanges();

    this.seguimientoService.verificarCumplimientoDiario(this.dni, this.fechaConsulta)
      .subscribe({
        next: (datos) => {
          console.log('✅ Datos de cumplimiento recibidos:', datos);

          if (!datos || !datos.calorias) {
            this.errorMensaje = 'No se encontraron datos para este DNI y fecha.';
            this.cargando = false;
            this.resumenCargado = false;
            this.datosNutricionales = null;
            this.inicializarGraficoVacio();
            this.cdr.detectChanges();
            return;
          }

          const promedioPorcentaje = (
            datos.calorias.porcentaje +
            datos.proteinas.porcentaje +
            datos.grasas.porcentaje +
            datos.carbohidratos.porcentaje
          ) / 4;

          this.datosNutricionales = datos;
          this.porcentajeCumplimiento = promedioPorcentaje;
          this.resumenCargado = true;
          this.cargando = false;

          this.seguimientoService.obtenerResumenPorDniYFecha(this.dni, this.fechaConsulta)
            .subscribe({
              next: (resumen) => {
                console.log("Resumen recibido:", resumen);

                this.nombrePaciente = resumen.nombrePaciente;
                this.actualizarGrafico(this.porcentajeCumplimiento, this.nombrePaciente);
                this.cdr.detectChanges();
              },
              error: () => {
                this.nombrePaciente = 'Paciente';
                this.actualizarGrafico(this.porcentajeCumplimiento, this.nombrePaciente);
                this.cdr.detectChanges();
              }
            });

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('❌ Error al obtener datos:', error);

          this.errorMensaje = error.error?.message ||
            'No se encontraron datos para este DNI y fecha. Verifique que el paciente tenga seguimiento registrado.';
          this.cargando = false;
          this.resumenCargado = false;
          this.datosNutricionales = null;

          this.inicializarGraficoVacio();
          this.cdr.detectChanges();
        }
      });
  }

  calcularPorcentaje(consumido: number, requerido: number): number {
    if (!requerido || requerido === 0) return 0;
    return Math.min(Math.round((consumido / requerido) * 100), 100);
  }

  limpiarBusqueda(): void {
    this.dni = '';
    this.fechaConsulta = '';
    this.datosNutricionales = null;
    this.nombrePaciente = '';
    this.resumenCargado = false;
    this.errorMensaje = '';
    this.cargando = false;
    this.porcentajeCumplimiento = 0;

    this.inicializarGraficoVacio();
    this.cdr.detectChanges();
  }
}
