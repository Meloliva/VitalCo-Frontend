import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {NgClass, NgIf} from '@angular/common';

// Imports de Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-nueva-password',
  templateUrl: './nueva-password.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,

    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    NgIf


  ],
  styleUrls: ['./nueva-password.css']
})
export class NuevaPasswordComponent implements OnInit {
  passwordForm: FormGroup;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.passwordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Inicialización del componente
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.passwordForm.valid) {
      const email = this.passwordForm.get('email')?.value;
      const newPassword = this.passwordForm.value.password;

      console.log('Email:', email);
      console.log('Nueva contraseña:', newPassword);

      // Redirige a la página de éxito
      this.router.navigate(['/password-success']);
    }
  }

  // Métodos para obtener errores de los campos
  getEmailErrorMessage() {
    const emailControl = this.passwordForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'El correo electrónico es requerido';
    }
    if (emailControl?.hasError('email')) {
      return 'Ingrese un correo electrónico válido';
    }
    return '';
  }

  getPasswordErrorMessage() {
    const passwordControl = this.passwordForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'La contraseña es requerida';
    }
    if (passwordControl?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return '';
  }
}
