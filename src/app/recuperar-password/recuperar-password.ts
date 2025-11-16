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
    RouterModule
  ],
  templateUrl: './recuperar-password.html',
  styleUrls: ['./recuperar-password.css']
})
export class RecuperarPasswordComponent {
  recoveryForm: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private recuperarService: RecuperarPasswordService
  ) {
    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    this.error = '';
    if (this.recoveryForm.invalid) {
      this.recoveryForm.markAllAsTouched();
      return;
    }
    const email = this.recoveryForm.value.email;
    console.log('Solicitando recuperación para', email);
    this.recuperarService.solicitarRecuperacion(email).subscribe({
      next: (res) => {
        console.log('solicitarRecuperacion next:', res);
        sessionStorage.setItem('recuperarCorreo', email);
        this.router.navigate(['/recuperar-password/verificar-codigo'], { queryParams: { email } });
      },
      error: (err) => {
        console.error('solicitarRecuperacion error:', err);
        this.error = err?.error?.mensaje || err?.error || 'Error al enviar código';
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
