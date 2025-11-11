import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-seleccion-registro',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './seleccion-registro.html',
  styleUrl: './seleccion-registro.css'
})
export class SeleccionRegistro {
  constructor(private router: Router) {}

  registrarPaciente() {
    this.router.navigate(['/registro-usuario']);
  }

  registrarNutricionista() {
    this.router.navigate(['/registro']);
  }
}
