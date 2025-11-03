import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seleccion-registro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seleccion-registro.html',
  styleUrl: './seleccion-registro.css'
})
export class SeleccionRegistro {
  constructor(private router: Router) {}

  registrarPaciente() {
    // Guarda el tipo en localStorage (opcional, si lo usas luego)
    localStorage.setItem('userType', 'paciente');
    // Redirige al registro de paciente
    this.router.navigate(['/registro-paciente']);
  }

  registrarNutricionista() {
    localStorage.setItem('userType', 'nutricionista');
    // Redirige al registro de nutricionista
    this.router.navigate(['/registro']);
  }
}
