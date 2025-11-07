import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

interface AuthResponse {
  jwt: string;
  roles: string[];
}

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
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
        usuario: ['', [
        Validators.required,
        Validators.pattern(/^\d{8}$/)
          ]],// ← Solo 8 dígitos numéricos
      password: ['', [Validators.required, Validators.minLength(6)]]
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

      this.http.post<AuthResponse>('http://localhost:8080/api/authenticate', {
        dni: usuario,
        contraseña: password
      }).subscribe({
        next: (response) => {
          console.log('🔑 JWT recibido:', response.jwt);

          if (response.jwt) {
            localStorage.setItem('token', response.jwt);
            console.log('✅ Token guardado:', localStorage.getItem('token'));

            this.router.navigate(['/sistema/progreso-paciente']);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error en login:', error);
          this.errorMessage = 'Usuario o contraseña incorrectos';
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
