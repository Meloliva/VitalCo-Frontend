import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nutri-progreso-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    if (this.vistaActual === 'ver' || this.vistaActual === 'editar' || this.vistaActual === 'confirmacion') {
      this.vistaActual = 'resultados';
    } else {
      this.vistaActual = 'buscar';
    }
  }

  porcentaje(actual: number, meta: number) {
    return (actual / meta) * 100;
  }
}

