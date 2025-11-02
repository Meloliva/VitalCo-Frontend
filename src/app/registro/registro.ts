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
  selectedImage = signal<string | null>(null);

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

    // Formulario paso 2 - foto ya NO es requerida
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
      // Ya no requiere imagen para continuar
      this.step.set(3);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput() {
    document.getElementById('fileInput')?.click();
  }

  goBack() {
    this.step.set(1);
  }

  iniciar() {
    this.router.navigate(['/perfil-nutricionista']);
  }
}
