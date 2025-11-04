import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserService, UserProfile } from '../service/userlayout-service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class Perfil implements OnInit {
  perfilForm!: FormGroup;
  usuario!: UserProfile | null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.inicializarFormulario();
    this.cargarDatosUsuario();
  }

  inicializarFormulario() {
    this.perfilForm = this.fb.group({
      nombre: [''],
      apellido: [''],
      correo: ['', [Validators.required, Validators.email]],
      grado: [''],
      universidad: [''],
      turno: [''],
      password: ['', [Validators.minLength(6)]],
      asociaciones: ['']
    });
  }

  cargarDatosUsuario() {
    this.userService.getCurrentUserProfile().subscribe({
      next: (data) => {
        this.usuario = data;
        console.log('Usuario cargado:', data);

        // Rellenar el formulario
        this.perfilForm.patchValue({
          nombre: data.nombre,
          apellido: data.apellido,
          correo: data.correo,
          grado: data['paciente']?.['grado'] || '',
          universidad: data['paciente']?.['universidad'] || '',
          turno: data['paciente']?.['turno'] || '',
          asociacion: data['paciente']?.['asociaciones'] || ''
        });
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
      }
    });
  }

  guardar() {
    if (this.perfilForm.invalid) {
      alert('Por favor completa los campos correctamente.');
      return;
    }

    const datosActualizados = { ...this.usuario, ...this.perfilForm.value };

    this.userService.updateAvatar(datosActualizados.fotoPerfil || '').subscribe({
      next: () => {
        alert('Perfil actualizado correctamente');
      },
      error: (err) => {
        console.error('Error al actualizar perfil:', err);
      }
    });
  }

  eliminarCuenta() {
    const confirmar = confirm('¿Seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.');
    if (confirmar) {
      this.userService.eliminarCuenta().subscribe({
        next: () => {
          alert('Tu cuenta ha sido eliminada correctamente.');
          this.salir();
        },
        error: err => {
          console.error('Error al eliminar la cuenta:', err);
          alert('Ocurrió un error al intentar eliminar tu cuenta.');
        }
      });
    }
  }

  salir() {
    this.userService.clearUser();
    localStorage.clear();
    this.router.navigate(['/inicio']);
  }
}
