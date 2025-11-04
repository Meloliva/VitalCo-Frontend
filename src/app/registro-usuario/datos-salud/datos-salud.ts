import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {Router} from '@angular/router';

@Component({
  selector: 'app-datos-salud',
  standalone: true,
  templateUrl: './datos-salud.html',
  styleUrls: ['./datos-salud.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatProgressBarModule
  ]
})
export class DatosSaludComponent implements OnInit {
  datosSaludForm: FormGroup;
  progressValue = 40; // 50% de progreso (segunda pantalla)

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.datosSaludForm = this.formBuilder.group({
      edad: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      altura: ['', [Validators.required, Validators.min(50), Validators.max(300)]],
      peso: ['', [Validators.required, Validators.min(1), Validators.max(500)]],
      trigliceridos: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // Cargar datos-salud previos si existen en el servicio o localStorage
  }

  onSubmit(): void {
    if (this.datosSaludForm.valid) {
      const datosSalud = this.datosSaludForm.value;
      console.log('Datos de salud:', datosSalud);

      // Guardar en servicio o localStorage
      // this.registroService.setDatosSalud(datosSalud);

      // Navegar a la siguiente pantalla
      this.router.navigate(['/objetivo']);
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.datosSaludForm.controls).forEach(key => {
        this.datosSaludForm.get(key)?.markAsTouched();
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/registro-usuario']);
  }
}
