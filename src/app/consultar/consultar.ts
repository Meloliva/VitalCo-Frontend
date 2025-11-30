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

  // ✅ NUEVAS PROPIEDADES FALTANTES
  esForbidden: boolean = false;
  cargandoHistorial: boolean = false;
  Math = Math; // ✅ Exponer Math para usarlo en el template

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
    if (this.chartCircular) {
      this.chartCircular.destroy();
      this.chartCircular = null;
    }
    if (this.chartAvance) {
      this.chartAvance.destroy();
      this.chartAvance = null;
    }
  }

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
    this.esForbidden = false;

    this.seguimientoService.verificarCumplimientoDiario(this.dni, this.fechaConsulta)
      .subscribe({
        next: (datos) => {
          if (!datos) {
            this.mensajeError('No hay datos para esta fecha.');
            return;
          }

          this.datosNutricionales = datos;
          const pCal = datos.calorias?.porcentaje || 0;
          const pPro = datos.proteinas?.porcentaje || 0;
          const pGra = datos.grasas?.porcentaje || 0;
          const pCar = datos.carbohidratos?.porcentaje || 0;
          this.porcentajeCumplimiento = (pCal + pPro + pGra + pCar) / 4;

          this.resumenCargado = true;
          this.cargando = false;

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
          console.error('Error completo:', err);
          this.cargando = false;

          // ✅ Mejorar detección de error 403
          if (err.status === 403 || err.error?.error?.includes('cita')) {
            this.esForbidden = true;
            this.mensajeError('No tienes citas aceptadas con este paciente.');
          } else if (err.status === 404) {
            this.mensajeError('Paciente no encontrado.');
          } else {
            this.mensajeError(err.error?.error || 'No se encontraron datos para este DNI y fecha.');
          }
        }
      });
  }

  iniciarVisualizacion() {
    this.cdr.detectChanges();

    setTimeout(() => {
      console.log('🔍 Iniciando visualización...');
      this.destruirGraficas();
      this.renderizarGraficoCircular(this.porcentajeCumplimiento);
      this.cargarPlanesHistorial();
    }, 200);
  }

  cargarPlanesHistorial() {
    console.log('📊 Cargando planes historial para DNI:', this.dni);
    this.cargandoHistorial = true; // ✅ Activar spinner

    this.seguimientoService.listarPlanes(this.dni).subscribe({
      next: (planes) => {
        console.log('✅ Planes recibidos:', planes);

        // ✅ Adaptar PlanAlimenticioDTO al formato esperado
        this.planesDisponibles = planes.map((plan: any, index: number) => ({
          id: plan.id,
          nombrePlanNutricional: plan.nombrePlanNutricional || 'Plan Nutricional',
          fechainicio: plan.fechainicio || plan.fechaCreacion,
          fechafin: index === 0 ? null : plan.fechafin,
          calorias: plan.caloriasDiaria,
          proteinas: plan.proteinasDiaria,
          grasas: plan.grasasDiaria,
          carbohidratos: plan.carbohidratosDiaria
        }));

        this.cargandoHistorial = false; // ✅ Desactivar spinner

        if (planes.length > 0) {
          this.planSeleccionado = this.planesDisponibles[0];
          console.log('📅 Plan seleccionado:', this.planSeleccionado);

          this.cdr.detectChanges();
          setTimeout(() => {
            this.actualizarGraficoAvance();
          }, 100);
        } else {
          console.warn('⚠️ No hay planes disponibles');
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar planes:', err);
        this.cargandoHistorial = false; // ✅ Desactivar spinner en error
      }
    });
  }

  actualizarGraficoAvance() {
    if (!this.planSeleccionado) {
      console.warn('⚠️ No hay plan seleccionado');
      return;
    }

    console.log('📈 Actualizando gráfico de avance...');

    const fechaInicio = this.planSeleccionado.fechainicio;
    const fechaFin = this.planSeleccionado.fechafin || new Date().toISOString().split('T')[0];

    console.log(`📅 Rango: ${fechaInicio} - ${fechaFin}`);

    if (this.chartAvance) {
      this.chartAvance.destroy();
      this.chartAvance = null;
    }

    this.seguimientoService.obtenerHistorialFiltrado(this.dni, fechaInicio, fechaFin)
      .subscribe({
        next: (historial) => {
          console.log('✅ Historial recibido:', historial);

          if (!historial || historial.length === 0) {
            console.warn('⚠️ Historial vacío');
            return;
          }

          setTimeout(() => {
            this.renderizarGraficoLineal(historial);
          }, 50);
        },
        error: (err) => {
          console.error('❌ Error al obtener historial:', err);
        }
      });
  }

  renderizarGraficoCircular(porcentaje: number) {
    const canvas = document.getElementById('grafico-consulta') as HTMLCanvasElement;

    if (!canvas) {
      console.error('❌ Canvas circular no encontrado');
      return;
    }

    console.log('✅ Renderizando gráfico circular:', porcentaje);

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

    if (!canvas) {
      console.error('❌ Canvas lineal no encontrado - Verificando DOM...');
      return;
    }

    console.log('✅ Canvas encontrado, renderizando gráfico lineal con', historial.length, 'puntos');

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ No se pudo obtener contexto 2D');
      return;
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(0, 191, 97, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 191, 97, 0.0)');

    const labels = historial.map(h => {
      const d = new Date(h.fecha + 'T00:00:00');
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
            pointRadius: 3,
            pointHoverRadius: 6
          },
          {
            label: 'Meta',
            data: historial.map(h => h.metaCalorias),
            borderColor: '#FF6384',
            borderDash: [5, 5],
            pointRadius: 0,
            borderWidth: 2,
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

    console.log('✅ Gráfico lineal renderizado exitosamente');
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
    this.nombrePaciente = '';
    this.planesDisponibles = [];
    this.planSeleccionado = null;
    this.esForbidden = false;
    this.destruirGraficas();
  }
}
