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

  resumenCargado: boolean = false;
  errorMensaje: string = '';
  cargando: boolean = false;
  nombrePaciente: string = '';

  datosNutricionales: any = null;

  constructor(
    private router: Router,
    private seguimientoService: SeguimientoService
  ) {}

  ngAfterViewInit(): void {
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
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;

      if (this.chart) this.chart.destroy();

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
              text: 'Esperando búsqueda...'
            }
          }
        }
      });
    });
  }

  actualizarGrafico(datos: SeguimientoResumenDTO): void {
    requestAnimationFrame(() => {
      const canvas = document.getElementById('grafico-consulta') as HTMLCanvasElement;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;

      if (this.chart) this.chart.destroy();

      const totales = datos.totalesNutricionales;

      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Proteínas', 'Grasas', 'Carbohidratos'],
          datasets: [
            {
              label: 'Consumido (g)',
              data: [
                totales.proteinas,
                totales.grasas,
                totales.carbohidratos
              ],
              backgroundColor: '#4CAF50',
              borderRadius: 6
            },
            {
              label: 'Requerido (g)',
              data: [
                totales.requerido_proteinas,
                totales.requerido_grasas,
                totales.requerido_carbohidratos
              ],
              backgroundColor: '#FF9800',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `Reporte de ${datos.nombrePaciente}`
            }
          }
        }
      });
    });
  }

  buscar(event: Event): void {
    event.preventDefault();

    if (!this.dni || !this.fechaConsulta) {
      this.errorMensaje = 'Ingrese DNI y fecha válidos';
      return;
    }

    this.errorMensaje = '';
    this.cargando = true;

    // 🔴 Simulación temporal de datos (en lugar de llamar al backend)
    setTimeout(() => {
      const datosSimulados: SeguimientoResumenDTO = {
        nombrePaciente: 'Mariana García',
        totalesNutricionales: {
          calorias: 1800,
          carbohidratos: 220,
          proteinas: 90,
          grasas: 60,
          requerido_calorias: 2000,
          requerido_carbohidratos: 250,
          requerido_proteinas: 100,
          requerido_grasas: 70
        },
        caloriasPorHorario: {
          desayuno: 500,
          snack: 200,
          almuerzo: 700,
          cena: 400
        }
      };

      this.datosNutricionales = datosSimulados;
      this.nombrePaciente = datosSimulados.nombrePaciente;
      this.resumenCargado = true;
      this.cargando = false;

      this.actualizarGrafico(datosSimulados);
    }, 800);

    // 🟠 Conexión real (descomentar cuando funcione login/backend)
    /*
    this.seguimientoService.obtenerResumenPorDniYFecha(this.dni, this.fechaConsulta)
      .subscribe({
        next: (resumen) => {
          this.datosNutricionales = resumen;
          this.nombrePaciente = resumen.nombrePaciente;
          this.resumenCargado = true;
          this.cargando = false;
          this.actualizarGrafico(resumen);
        },
        error: (error) => {
          this.errorMensaje = 'Error al obtener los datos';
          this.cargando = false;
          this.inicializarGraficoVacio();
        }
      });
    */
  }

  calcularPorcentaje(consumido: number, requerido: number): number {
    if (!requerido) return 0;
    return Math.round((consumido / requerido) * 100);
  }
  limpiarBusqueda(): void {
    this.dni = '';
    this.fechaConsulta = '';
    this.datosNutricionales = null;
    this.nombrePaciente = '';
    this.resumenCargado = false;
    this.errorMensaje = '';

    this.inicializarGraficoVacio();
  }
}
