import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class Perfil {
  perfilForm: FormGroup;
  imagenPerfil: string = 'https://placehold.co/70x70/00BF61/FFFFFF?text=Foto';

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
      this.logoutAndRedirect();
    }
  }

  cambiarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPerfil = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  eliminarFoto(): void {
    this.imagenPerfil = 'https://placehold.co/70x70/00BF61/FFFFFF?text=Foto';
  }

  abrirSelectorFoto(): void {
    const input = document.getElementById('fileInput') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  private logoutAndRedirect(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userAvatar');
    this.router.navigate(['/inicio']);
  }
}
