import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';

import { NutricionistaRequerimientoDTO } from '../models/nutricionista-requerimiento';
import { SeguimientoDTO } from '../models/seguimiendo-paciente.model';

import { SeguimientoService } from '../service/seguimiento.service';
import { NutricionistaService, UsuarioDTO } from '../service/nutricionista.service';
import { PacienteService, PlanNutricionalDTO } from '../service/paciente.service';
import { Paciente } from '../models/paciente.model';

interface PacienteVista {
  dni: string;
  nombre: string;
  apellido: string;
  foto: string | null;

  calorias: { actual: number; meta: number };
  proteinas: { actual: number; meta: number };
  carbohidratos: { actual: number; meta: number };
  grasas: { actual: number; meta: number };

  desayuno: number;
  almuerzo: number;
  snack: number;
  cena: number;

  idPlanNutricional: number;
}

@Component({
  selector: 'app-nutri-progreso-pacientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatSelectModule
  ],
  templateUrl: './nutri-progreso-pacientes.html',
  styleUrls: ['./nutri-progreso-pacientes.css']
})
export class NutriProgresoPacientesComponent implements OnInit {

  vista: 'buscar' | 'lista' | 'detalle' | 'editar' = 'buscar';

  fechaBusqueda = '';
  dniBusqueda = '';

  pacientes: PacienteVista[] = [];
  pacienteActual: PacienteVista | null = null;

  paginaActual = 0;
  itemsPorPagina = 5;

  // ✅ Planes nutricionales disponibles
  planesNutricionales: PlanNutricionalDTO[] = [];
  planNutricionalSeleccionado: number = 0;
  planNutricionalActual: string = '';

  metasEditadas = {
    calorias: 0,
    proteinas: 0,
    grasas: 0,
    carbohidratos: 0
  };

  minimoPermitido = {
    calorias: 0,
    proteinas: 0,
    grasas: 0,
    carbohidratos: 0
  };

  erroresValidacion = {
    calorias: '',
    proteinas: '',
    grasas: '',
    carbohidratos: ''
  };

  cargando = false;

  constructor(
    private seguimientoService: SeguimientoService,
    private nutricionistaService: NutricionistaService,
    private pacienteService: PacienteService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const hoy = new Date();
    this.fechaBusqueda = hoy.toISOString().split('T')[0];
    this.cargarPlanesNutricionales();
  }

  private cargarPlanesNutricionales(): void {
    this.pacienteService.listarPlanesNutricionales().subscribe({
      next: (planes) => {
        this.planesNutricionales = planes;
        console.log('✅ Planes nutricionales cargados:', planes);
      },
      error: (err) => {
        console.error('❌ Error al cargar planes nutricionales:', err);
      }
    });
  }

  get pacientesPaginados(): PacienteVista[] {
    const inicio = this.paginaActual * this.itemsPorPagina;
    return this.pacientes.slice(inicio, inicio + this.itemsPorPagina);
  }

  onCambioPagina(event: PageEvent) {
    this.paginaActual = event.pageIndex;
    this.itemsPorPagina = event.pageSize;
  }

  buscar() {
    if (!this.fechaBusqueda) {
      this.mensaje('Seleccione una fecha');
      return;
    }

    if (!this.dniBusqueda.trim()) {
      this.mensaje('Ingrese un DNI para buscar');
      return;
    }

    this.cargando = true;
    const dniLimpio = this.dniBusqueda.trim();

    console.log('🔍 Buscando paciente con DNI:', dniLimpio);
    console.log('📅 Fecha de búsqueda:', this.fechaBusqueda);

    this.nutricionistaService.buscarPacientePorDni(dniLimpio).subscribe({
      next: (paciente: Paciente) => {
        console.log('✅ Paciente encontrado:', paciente);

        if (!paciente.idPlanNutricional) {
          this.mensaje("Este paciente no tiene un plan nutricional asignado.");
          this.cargando = false;
          this.cdr.markForCheck();
          return;
        }

        const idPlan = paciente.idPlanNutricional.id;
        console.log('📋 ID Plan:', idPlan);
        console.log('👤 ID Usuario:', paciente.idusuario);

        this.seguimientoService.obtenerResumenPorDniYFecha(dniLimpio, this.fechaBusqueda)
          .subscribe({
            next: (data: SeguimientoDTO) => {
              console.log('✅ Seguimiento encontrado:', data);

              const vista = this.mapearPaciente(
                data,
                paciente.idusuario,
                idPlan
              );

              this.pacientes = [vista];
              this.vista = 'lista';
              this.paginaActual = 0;
              this.cargando = false;
              this.cdr.markForCheck();
            },
            error: (error) => {
              console.error('❌ Error en obtenerResumenPorDniYFecha:', error);
              console.error('Status:', error.status);
              console.error('Message:', error.message);

              this.mensaje("No hay seguimiento para esa fecha.");
              this.cargando = false;
              this.cdr.markForCheck();
            }
          });
      },
      error: (error) => {
        console.error('❌ Error en buscarPacientePorDni:', error);
        this.mensaje("No se encontró un paciente con ese DNI.");
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  private mapearPaciente(
    datos: SeguimientoDTO,
    usuario: UsuarioDTO,
    idPlan: number
  ): PacienteVista {

    const t = datos.totalesNutricionales;
    const c = datos.caloriasPorHorario;

    return {
      dni: usuario.dni || '',
      nombre: usuario.nombre || 'N/A',
      apellido: usuario.apellido || 'N/A',
      foto: usuario.fotoPerfil || null,

      calorias: { actual: t.calorias, meta: t.requerido_calorias },
      proteinas: { actual: t.proteinas, meta: t.requerido_proteinas },
      carbohidratos: { actual: t.carbohidratos, meta: t.requerido_carbohidratos },
      grasas: { actual: t.grasas, meta: t.requerido_grasas },

      desayuno: c.desayuno || 0,
      almuerzo: c.almuerzo || 0,
      snack: c.snack || 0,
      cena: c.cena || 0,

      idPlanNutricional: idPlan
    };
  }

  verDetalle(p: PacienteVista) {
    this.pacienteActual = { ...p };
    this.vista = 'detalle';
    this.cdr.markForCheck();
  }

  abrirEdicion(p: PacienteVista) {
    this.pacienteActual = { ...p };
    this.metasEditadas = {
      calorias: p.calorias.meta,
      proteinas: p.proteinas.meta,
      grasas: p.grasas.meta,
      carbohidratos: p.carbohidratos.meta
    };

    this.planNutricionalSeleccionado = p.idPlanNutricional;
    const planActual = this.planesNutricionales.find(plan => plan.id === p.idPlanNutricional);
    this.planNutricionalActual = planActual
      ? `${planActual.objetivo} - ${planActual.duracion}`
      : 'No definido';

    this.minimoPermitido = {
      calorias: p.calorias.actual,
      proteinas: p.proteinas.actual,
      grasas: p.grasas.actual,
      carbohidratos: p.carbohidratos.actual
    };

    this.erroresValidacion = {
      calorias: '',
      proteinas: '',
      grasas: '',
      carbohidratos: ''
    };

    this.vista = 'editar';
    this.cdr.markForCheck();
  }

  validarCampo(campo: 'calorias' | 'proteinas' | 'grasas' | 'carbohidratos') {
    const valor = this.metasEditadas[campo];
    const minimo = this.minimoPermitido[campo];

    if (valor < minimo) {
      this.erroresValidacion[campo] = `Mínimo permitido: ${minimo} (ya consumido)`;
      return false;
    } else {
      this.erroresValidacion[campo] = '';
      return true;
    }
  }

  validarTodos(): boolean {
    const camposValidos = this.validarCampo('calorias') &&
      this.validarCampo('proteinas') &&
      this.validarCampo('grasas') &&
      this.validarCampo('carbohidratos');

    if (!camposValidos) {
      this.mensaje('Por favor, revise los valores ingresados.');
    }

    return camposValidos;
  }

  guardar() {
    if (!this.pacienteActual) return;

    if (!this.validarTodos()) {
      this.cdr.markForCheck();
      return;
    }

    const dto: NutricionistaRequerimientoDTO = {
      idPlanNutricional: this.planNutricionalSeleccionado,
      caloriasDiaria: this.metasEditadas.calorias,
      proteinasDiaria: this.metasEditadas.proteinas,
      grasasDiaria: this.metasEditadas.grasas,
      carbohidratosDiaria: this.metasEditadas.carbohidratos
    };

    this.cargando = true;

    this.seguimientoService.editarPlanAlimenticio(this.pacienteActual.dni, dto)
      .subscribe({
        next: () => {
          if (this.pacientes.length > 0) {
            this.pacientes[0].calorias.meta = this.metasEditadas.calorias;
            this.pacientes[0].proteinas.meta = this.metasEditadas.proteinas;
            this.pacientes[0].grasas.meta = this.metasEditadas.grasas;
            this.pacientes[0].carbohidratos.meta = this.metasEditadas.carbohidratos;
            this.pacientes[0].idPlanNutricional = this.planNutricionalSeleccionado;

            this.pacienteActual = { ...this.pacientes[0] };
          }

          this.mensaje("Metas nutricionales y plan actualizados.");
          this.vista = 'detalle';
          this.cargando = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.mensaje("Error al guardar cambios.");
          this.cargando = false;
          this.cdr.markForCheck();
        }
      });
  }

  volver() {
    if (this.vista === 'detalle' || this.vista === 'editar') {
      this.vista = 'lista';
    } else {
      this.vista = 'buscar';
      this.pacientes = [];
    }
    this.pacienteActual = null;
    this.cdr.markForCheck();
  }

  porcentaje(actual: number, meta: number): number {
    return meta > 0 ? Math.min((actual / meta) * 100, 100) : 0;
  }

  private mensaje(txt: string) {
    this.snackBar.open(txt, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
