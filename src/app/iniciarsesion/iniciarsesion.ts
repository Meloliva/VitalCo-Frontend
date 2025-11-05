import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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
    RouterModule
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
      usuario: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
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
