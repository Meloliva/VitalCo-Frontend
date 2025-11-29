import { Component, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  SeguimientoService,
  VerificarCumplimientoResponse,
  HistorialSemanalDTO
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
  // Filtros
  fechaConsulta: string = '';
  dni: string = '';

  // Datos
  datosNutricionales: VerificarCumplimientoResponse | null = null;
  nombrePaciente: string = '';
  planesDisponibles: any[] = [];
  planSeleccionado: any = null;

  // Estado
  resumenCargado: boolean = false;
  errorMensaje: string = '';
  cargando: boolean = false;
  porcentajeCumplimiento: number = 0;

  // Gráficos
  private chartCircular: any;
  private chartAvance: any;

  constructor(
    private router: Router,
    private seguimientoService: SeguimientoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.destruirGraficas();
  }

  destruirGraficas() {
    if (this.chartCircular) this.chartCircular.destroy();
    if (this.chartAvance) this.chartAvance.destroy();
  }

  // --- LÓGICA PRINCIPAL: BUSCAR ---
  buscar(event: Event): void {
    event.preventDefault();

    if (!this.dni || !this.fechaConsulta) {
      this.mensajeError('Ingrese DNI y fecha válidos');
      return;
    }

    this.cargando = true;
    this.errorMensaje = '';
    this.resumenCargado = false;
    this.datosNutricionales = null;
    this.destruirGraficas();

    // 1. Obtener Datos del Día (Circular)
    this.seguimientoService.verificarCumplimientoDiario(this.dni, this.fechaConsulta)
      .subscribe({
        next: (datos) => {
          if (!datos) {
            this.mensajeError('No hay datos para esta fecha.');
            return;
          }
          // Guardamos datos
          this.datosNutricionales = datos;

          // Calculamos porcentaje promedio seguro (evitando undefined)
          const pCal = datos.calorias?.porcentaje || 0;
          const pPro = datos.proteinas?.porcentaje || 0;
          const pGra = datos.grasas?.porcentaje || 0;
          const pCar = datos.carbohidratos?.porcentaje || 0;
          this.porcentajeCumplimiento = (pCal + pPro + pGra + pCar) / 4;

          this.resumenCargado = true;
          this.cargando = false;

          // 2. Obtener Nombre del Paciente
          this.seguimientoService.obtenerResumenPorDniYFecha(this.dni, this.fechaConsulta)
            .subscribe({
              next: (resumen) => {
                this.nombrePaciente = resumen.nombrePaciente || 'Paciente';
                this.iniciarVisualizacion();
              },
              error: () => {
                this.nombrePaciente = 'Paciente';
                this.iniciarVisualizacion();
              }
            });
        },
        error: (err) => {
          console.error(err);
          this.mensajeError('No se encontraron datos para este DNI y fecha.');
        }
      });
  }

  iniciarVisualizacion() {
    this.cdr.detectChanges(); // Renderizar HTML

    setTimeout(() => {
      // 1. Renderizar Gráfico Circular (Día)
      this.renderizarGraficoCircular(this.porcentajeCumplimiento);

      // 2. Cargar Historial de Planes (Para el Dropdown)
      this.cargarPlanesHistorial();
    }, 100);
  }

  // --- HISTORIAL DE PLANES ---
  cargarPlanesHistorial() {
    this.seguimientoService.listarPlanes(this.dni).subscribe({
      next: (planes) => {
        this.planesDisponibles = planes;
        if (planes.length > 0) {
          // Seleccionar el plan que coincide con la fecha de consulta, o el actual
          // Por simplicidad, seleccionamos el más reciente (index 0) o el que abarca la fecha
          this.planSeleccionado = planes[0];
          this.actualizarGraficoAvance();
        }
      }
    });
  }

  actualizarGraficoAvance() {
    if (!this.planSeleccionado) return;

    const fechaInicio = this.planSeleccionado.fechainicio;
    // Si no tiene fecha fin (es actual), usamos hoy
    const fechaFin = this.planSeleccionado.fechafin || new Date().toISOString().split('T')[0];

    // Destruir anterior si existe
    if (this.chartAvance) this.chartAvance.destroy();

    this.seguimientoService.obtenerHistorialFiltrado(this.dni, fechaInicio, fechaFin)
      .subscribe({
        next: (historial) => {
          this.renderizarGraficoLineal(historial);
        }
      });
  }

  // --- RENDERIZADO DE GRÁFICAS ---
  renderizarGraficoCircular(porcentaje: number) {
    const canvas = document.getElementById('grafico-consulta') as HTMLCanvasElement;
    if (!canvas) return;

    const cumplido = Math.min(Math.max(porcentaje, 0), 100);

    this.chartCircular = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Cumplido', 'Restante'],
        datasets: [{
          data: [cumplido, 100 - cumplido],
          backgroundColor: ['#00BF61', '#F3F4F6'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } }
      }
    });
  }

  renderizarGraficoLineal(historial: HistorialSemanalDTO[]) {
    const canvas = document.getElementById('chartAvance') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const gradient = ctx!.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(0, 191, 97, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 191, 97, 0.0)');

    const labels = historial.map(h => {
      const d = new Date(h.fecha + 'T00:00:00'); // Corregir zona horaria
      return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    });

    this.chartAvance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Calorías Consumidas',
            data: historial.map(h => h.caloriasConsumidas),
            borderColor: '#00BF61',
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 6
          },
          {
            label: 'Meta',
            data: historial.map(h => h.metaCalorias),
            borderColor: '#FF6384',
            borderDash: [5, 5],
            pointRadius: 0,
            borderWidth: 1,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } },
          y: { beginAtZero: true, grid: { color: '#f0f0f0' } }
        },
        plugins: {
          legend: { position: 'top', align: 'end' }
        }
      }
    });
  }

  mensajeError(msg: string) {
    this.errorMensaje = msg;
    this.cargando = false;
    this.resumenCargado = false;
    this.cdr.detectChanges();
  }

  limpiarBusqueda() {
    this.dni = '';
    this.fechaConsulta = '';
    this.resumenCargado = false;
    this.datosNutricionales = null;
    this.errorMensaje = '';
    this.destruirGraficas();
  }
}
