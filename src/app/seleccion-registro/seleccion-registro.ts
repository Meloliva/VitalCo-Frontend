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
    // Por ahora solo muestra un mensaje, después implementarás esta ruta
    alert('Registro de paciente - Próximamente');
  }

  registrarNutricionista() {
    this.router.navigate(['/registro']);
  }
}
