import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLinkActive, RouterLink],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class Perfil {
  perfilForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.perfilForm = this.fb.group({
      asociacion: [''],
      grado: [''],
      universidad: [''],
      turno: [''],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  guardar() {
    if (this.perfilForm.valid) {
      console.log('Datos guardados:', this.perfilForm.value);
    } else {
      console.log('Formulario inválido');
    }
  }

  eliminarCuenta() {
    const confirmar = confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.');
    if (confirmar) {
      console.log('Cuenta eliminada');
      // Aquí puedes agregar la lógica para eliminar la cuenta del backend
      this.salir();
    }
  }

  salir() {
    // Limpiar cualquier dato de sesión
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userAvatar');

    // Redirigir a la página de inicio
    this.router.navigate(['/inicio']);
  }
}
