import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // RouterLink y RouterLinkActive ya no se necesitan aquí

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class Perfil {
  perfilForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router // Mantenemos Router para 'eliminarCuenta'
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
    // IMPORTANTE: 'confirm' bloquea el hilo y no es una buena práctica.
    // Deberías reemplazar esto con un componente de modal/diálogo.
    const confirmar = confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.');

    if (confirmar) {
      console.log('Cuenta eliminada');
      // Aquí puedes agregar la lógica para eliminar la cuenta del backend

      // Llamamos a la lógica de salir que estaba aquí
      this.logoutAndRedirect();
    }
  }

  /**
   * Esta función ahora solo la usa 'eliminarCuenta'
   */
  private logoutAndRedirect(): void {
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
