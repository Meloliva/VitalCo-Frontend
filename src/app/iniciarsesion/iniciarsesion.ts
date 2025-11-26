import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
// Importamos el servicio de autenticación
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-iniciarsesion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './iniciarsesion.html',
  styleUrl: './iniciarsesion.css',
})
export class Iniciarsesion implements OnInit {
  loginForm!: FormGroup;
  showPassword: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService // Usamos AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.loginForm.valueChanges.subscribe(() => {
      if (this.errorMessage) {
        this.errorMessage = '';
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      const { usuario, password } = this.loginForm.value;

      this.authService.login(usuario, password).subscribe({
        next: (response) => {
          // 🛑 CORRECCIÓN CRÍTICA:
          // Verificar si realmente llegó un token. Si response.jwt está vacío, es un login fallido.
          if (!response || !response.jwt) {
            this.errorMessage = 'Credenciales incorrectas.';
            this.isLoading = false;
            return; // Detenemos la ejecución aquí
          }

          // Si hay token, procedemos con la lógica de roles
          const roles = response.roles ? response.roles.map(r => r.replace('ROLE_', '')) : [];

          if (roles.includes('NUTRICIONISTA')) {
            this.router.navigate(['/nutricionista/perfil']);
          } else if (roles.includes('PACIENTE')) {
            this.router.navigate(['/sistema/perfil-paciente']);
          } else {
            this.router.navigate(['/']);
          }

          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error en login:', error);

          if (error.status === 403) {
            this.errorMessage = error.error?.message || 'Tu cuenta ha sido desactivada';
          } else if (error.status === 401) {
            this.errorMessage = error.error?.message || 'DNI o contraseña incorrectos';
          } else {
            this.errorMessage = error.error?.message || 'Error al iniciar sesión. Verifique sus datos.';
          }
          this.isLoading = false;
        }
      });
    }
  }

  loginWithFacebook(): void {
    console.log('Login con Facebook');
  }

  loginWithGoogle(): void {
    console.log('Login con Google');
  }
}
