// File: src/app/recuperar-password/recuperar-password.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {Router, RouterLink, RouterModule} from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RecuperarPasswordService } from '../service/recuperar-password.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './recuperar-password.html',
  styleUrls: ['./recuperar-password.css']
})
export class RecuperarPasswordComponent {
  recoveryForm: FormGroup;
  error = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private recuperarService: RecuperarPasswordService
  ) {
    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  ngOnInit(): void {
    // FIX CASILLA: Marca el control como 'tocado' para mostrar errores de validación inmediatamente al cargar.
    this.recoveryForm.get('email')?.markAsTouched();
  }

  onSubmit(): void {
    this.error = '';
    this.successMessage = '';
    if (this.recoveryForm.invalid) {
      this.recoveryForm.markAllAsTouched();
      return;
    }
    const email = this.recoveryForm.value.email;
    console.log('Solicitando recuperación para', email);
    this.recuperarService.solicitarRecuperacion(email).subscribe({
      next: (res) => {
        // La solicitud al backend fue exitosa.
        console.log('solicitarRecuperacion next:', res);

        // 1. Mostrar mensaje de éxito
        this.successMessage = '¡Se ha enviado un código de verificación a su correo!'; // <-- Mensaje de éxito
        sessionStorage.setItem('recuperarCorreo', email);

        // 2. Esperar 1.5 segundos antes de redirigir
        setTimeout(() => {
          this.router.navigate(['/recuperar-password/verificar-codigo'], { queryParams: { email } });
        }, 1500); // Redirige después de 1.5 segundos
      },
      error: (err) => {
        console.error('solicitarRecuperacion error:', err);
        this.error = 'Este correo no está registrado en la aplicación.';
      }
    });
  }

  get emailControl() {
    return this.recoveryForm.get('email');
  }

  getEmailErrorMessage(): string {
    const control = this.emailControl;
    if (control?.hasError('required')) return 'El correo electrónico es requerido';
    if (control?.hasError('email')) return 'Ingrese un correo electrónico válido';
    return '';
  }
}
