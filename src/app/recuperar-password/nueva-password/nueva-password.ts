import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RecuperarPasswordService } from '../../service/recuperar-password.service';

@Component({
  selector: 'app-nueva-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './nueva-password.html',
  styleUrls: ['./nueva-password.css']
})
export class NuevaPasswordComponent implements OnInit {
  passwordForm: FormGroup;
  showPassword = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private recuperarService: RecuperarPasswordService
  ) {
    this.passwordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    const correoGuardado = sessionStorage.getItem('recuperarCorreo');
    if (correoGuardado) {
      this.passwordForm.get('email')?.setValue(correoGuardado);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.error = '';
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const dto = {
      correo: this.passwordForm.value.email,
      nuevaContrasena: this.passwordForm.value.password
    };

    this.recuperarService.restablecerCuenta(dto).subscribe({
      next: () => {
        sessionStorage.removeItem('recuperarCorreo');
        this.router.navigate(['/iniciosesion']);
      },
      error: err => {
        this.error = err?.error?.mensaje || err?.error || 'Error al restablecer cuenta';
      }
    });
  }

  getEmailErrorMessage(): string {
    const control = this.passwordForm.get('email');
    if (control?.hasError('required')) return 'El correo electrónico es requerido';
    if (control?.hasError('email')) return 'Ingrese un correo electrónico válido';
    return '';
  }

  getPasswordErrorMessage(): string {
    const control = this.passwordForm.get('password');
    if (control?.hasError('required')) return 'La contraseña es requerida';
    if (control?.hasError('minlength')) return 'La contraseña debe tener al menos 6 caracteres';
    return '';
  }
}
