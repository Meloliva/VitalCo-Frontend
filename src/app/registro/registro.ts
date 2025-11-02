import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
  step = signal(1); // 1: datos usuario, 2: datos profesionales, 3: éxito
  registroForm: FormGroup;
  registroProfesionalForm: FormGroup;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    // Formulario paso 1
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      genero: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Formulario paso 2
    this.registroProfesionalForm = this.fb.group({
      asociacion: ['', Validators.required],
      universidad: ['', Validators.required],
      turno: ['', Validators.required]
    });
  }

  nextStep() {
    if (this.step() === 1 && this.registroForm.valid) {
      this.step.set(2);
    } else if (this.step() === 2 && this.registroProfesionalForm.valid) {
      this.step.set(3);
    }
  }

  goBack() {
    this.step.set(1);
  }

  iniciar() {
    this.router.navigate(['/perfil']);
  }
  cancelar() {
    this.router.navigate(['/inicio']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
