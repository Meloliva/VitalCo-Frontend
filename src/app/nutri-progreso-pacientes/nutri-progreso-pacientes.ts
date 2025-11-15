import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-nutri-progreso-pacientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatPaginatorModule
  ],
  templateUrl: './nutri-progreso-pacientes.html',
  styleUrls: ['./nutri-progreso-pacientes.css']
})
export class NutriProgresoPacientesComponent {

  vistaActual: 'buscar' | 'resultados' | 'ver' | 'editar' | 'confirmacion' = 'buscar';

  fechaSeguimiento = '';
  dniFiltro = '';

  pacientes = [
    {
      id: 1,
      nombre: 'Andrea García Heredia',
      dni: '20478945',
      estado: 'Editar Modificados',
      fecha: '16/09/25',
      calorias: { actual: 1600, meta: 2000 },
      macros: {
        proteina: { actual: 70, meta: 100 },
        carbohidratos: { actual: 200, meta: 250 },
        grasas: { actual: 97, meta: 100 }
      },
      comidas: { desayuno: 250, almuerzo: 600, snacks: 150, cena: 400 },
      metas: { calorias: 1157, proteinas: 90, grasas: 35, carbohidratos: 60, tiempo: '6 meses' }
    }
  ];

  pacienteSeleccionado: any = null;
  metasEditadas: any = {};
  mensajeConfirmacion = '';


  // 🔹 PAGINADOR
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pageSize = 3;
  pageIndex = 0;

  get pacientesPaginados() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.pacientes.slice(start, end);
  }

  onPageChange(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }


  buscar() {
    this.vistaActual = 'resultados';
  }

  verPaciente(paciente: any) {
    this.pacienteSeleccionado = paciente;
    this.vistaActual = 'ver';
  }

  editarPaciente(paciente: any) {
    this.pacienteSeleccionado = paciente;
    this.metasEditadas = { ...paciente.metas };
    this.vistaActual = 'editar';
  }

  guardarCambios() {
    this.pacienteSeleccionado.metas = { ...this.metasEditadas };
    this.vistaActual = 'confirmacion';
    this.mensajeConfirmacion = 'Se modificó correctamente';
  }

  volver() {
    if (['ver', 'editar', 'confirmacion'].includes(this.vistaActual)) {
      this.vistaActual = 'resultados';
    } else {
      this.vistaActual = 'buscar';
    }
  }

  porcentaje(actual: number, meta: number) {
    return (actual / meta) * 100;
  }
}

