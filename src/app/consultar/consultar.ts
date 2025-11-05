import { Component, AfterViewInit, OnDestroy } from '@angular/core';
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

  // Variables para mostrar los datos
  resumenCargado: boolean = false;
  errorMensaje: string = '';
  cargando: boolean = false;
  nombrePaciente: string = '';

  // Datos nutricionales
  datosNutricionales: any = null;

  constructor(
    private router: Router,
    private seguimientoService: SeguimientoService
  ) {}

  ngAfterViewInit(): void {
    // Inicializar gráfico vacío
    this.inicializarGraficoVacio();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  inicializarGraficoVacio(): void {
    requestAnimationFrame(() => {
      const canvas = document.getElementById('grafico-consulta') as HTMLCanvasElement;
      if (!canvas) {
        console.warn('Canvas no encontrado al inicializar gráfico');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.warn('No se pudo obtener el contexto 2D del canvas');
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
            legend: {
              display: true,
              labels: { color: '#333' }
            },
            title: {
              display: true,
              text: 'Esperando búsqueda...',
              color: '#666'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 20 }
            }
          }
        }
      });
    });
  }

  actualizarGrafico(datos: SeguimientoResumenDTO): void {
    requestAnimationFrame(() => {
      const canvas = document.getElementById('grafico-consulta') as HTMLCanvasElement;
      if (!canvas) {
        console.warn('Canvas no encontrado al actualizar gráfico');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.warn('No se pudo obtener el contexto 2D del canvas');
        return;
      }

      if (this.chart) {
        this.chart.destroy();
      }

      const totales = datos.totalesNutricionales;

      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Proteínas', 'Grasas', 'Carbohidratos'],
          datasets: [
            {
              label: 'Consumido (g)',
              data: [
                totales.proteinas || 0,
                totales.grasas || 0,
                totales.carbohidratos || 0
              ],
              backgroundColor: '#4CAF50',
              borderRadius: 6
            },
            {
              label: 'Requerido (g)',
              data: [
                totales.requerido_proteinas || 0,
                totales.requerido_grasas || 0,
                totales.requerido_carbohidratos || 0
              ],
              backgroundColor: '#FF9800',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: { color: '#333' }
            },
            title: {
              display: true,
              text: `Reporte de ${datos.nombrePaciente || 'Paciente'}`,
              color: '#333',
              font: { size: 16, weight: 'bold' }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 20 }
            }
          }
        }
      });
    });
  }

  buscar(event: Event): void {
    event.preventDefault();

    // Validaciones
    if (!this.dni || this.dni.trim() === '') {
      this.errorMensaje = 'Por favor, ingrese un DNI';
      return;
    }

    if (!this.fechaConsulta || this.fechaConsulta.trim() === '') {
      this.errorMensaje = 'Por favor, seleccione una fecha';
      return;
    }

    // Limpiar mensajes anteriores
    this.errorMensaje = '';
    this.resumenCargado = false;
    this.cargando = true;

    // Llamar al servicio
    this.seguimientoService.obtenerResumenPorDniYFecha(this.dni, this.fechaConsulta)
      .subscribe({
        next: (resumen) => {
          console.log('Resumen recibido:', resumen);
          this.datosNutricionales = resumen;
          this.nombrePaciente = resumen.nombrePaciente;
          this.resumenCargado = true;
          this.cargando = false;
          this.actualizarGrafico(resumen);
        },
        error: (error) => {
          console.error('Error al obtener resumen:', error);
          this.cargando = false;
          this.resumenCargado = false;

          if (error.status === 404) {
            this.errorMensaje = 'No se encontraron datos para este DNI y fecha';
          } else if (error.status === 403) {
            this.errorMensaje = 'No tienes permisos para consultar esta información';
          } else if (error.error?.message) {
            this.errorMensaje = error.error.message;
          } else {
            this.errorMensaje = 'Error al obtener los datos. Verifica el DNI y la fecha.';
          }

          this.inicializarGraficoVacio();
        }
      });
  }

  // Métodos auxiliares para obtener porcentajes
  calcularPorcentaje(consumido: number, requerido: number): number {
    if (!requerido || requerido === 0) return 0;
    return Math.round((consumido / requerido) * 100);
  }
}
