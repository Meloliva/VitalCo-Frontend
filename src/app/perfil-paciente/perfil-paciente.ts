import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { UserProfile, UserService } from '../service/userlayout-service';

// Para mostrar notificaciones

@Component({
  standalone: true,
  selector: 'app-perfil',
  templateUrl: './perfil-paciente.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  styleUrls: ['./perfil-paciente.css'],
})
export class PerfilPacienteComponent implements OnInit {
  perfilForm: FormGroup;
  planActual: string = 'Gratuito'; // Ejemplo, puedes obtener este valor desde tu backend

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar, // Para mostrar notificaciones
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.iniciarFormulario();
    this.cargarDatosUsuario();
    this.cargarPerfilPaciente();
  }

  // Inicializamos el formulario
  iniciarFormulario() {
    this.perfilForm = this.fb.group({
      edad: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      altura: ['', [Validators.required, Validators.min(50), Validators.max(250)]],
      sexo: ['', Validators.required],
      cntTrigliceridos: ['', [Validators.required, Validators.min(1)]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.minLength(6)]],
    });
  }
  cargarDatosUsuario(): void {
    this.userService.getCurrentUserProfile().subscribe({
      next: (user: UserProfile) => {
        console.log('Usuario cargado:', user);
        this.perfilForm.patchValue({
          sexo: user.genero || '',
        });
        // Plan actual
        const tipoPlan = user.paciente?.idPlan?.tipo;
        this.planActual = tipoPlan ? tipoPlan.replace('Plan ', '') : 'Free';
      },
      error: (err) => {
        console.error('Error al cargar el perfil del usuario:', err);
        this.mostrarNotificacion('Error al cargar los datos del usuario', true);
      },
    });
  }

  private normalizarGenero(genero: string | undefined): string {
    if (!genero) return '';
    const g = genero.toLowerCase();
    if (g === 'masculino') return 'Masculino';
    if (g === 'femenino') return 'Femenino';
    if (g === 'otro') return 'Otro';
    return '';
  }

  private cargarPerfilPaciente(): void {
    this.userService.getUsuarioPaciente().subscribe({
      next: (paciente: any) => {
        console.log('✅ Perfil paciente cargado:', paciente);

        // Rellenar el formulario con los datos del paciente
        this.perfilForm.patchValue({
          correo: paciente.idusuario?.correo || '',
          sexo: this.normalizarGenero(paciente.idusuario?.genero),
          edad: paciente.edad || '',
          altura: paciente.altura || '',
          cntTrigliceridos: paciente.trigliceridos || '',

        });

        // Plan actual (ejemplo: "Free" o "Premium")
        const tipoPlan = paciente.idplan?.tipo;
        this.planActual = tipoPlan ? tipoPlan.replace('Plan ', '') : 'Free';
      },
      error: (err) => {
        console.error('❌ Error al cargar el perfil del paciente:', err);
        this.mostrarNotificacion('Error al cargar los datos del paciente', true);
      },
    });
  }

  // Acciones
  cambiarFoto() {
    console.log('Cambiando foto...');
    // Lógica para cambiar foto
  }

  guardarCambios() {
    if (this.perfilForm.valid) {
      console.log('Formulario guardado', this.perfilForm.value);
      this.mostrarNotificacion('Cambios guardados exitosamente!');
    } else {
      this.mostrarNotificacion('Por favor, corrige los errores del formulario', true);
    }
  }

  eliminarCuenta() {
    const confirmacion = confirm('¿Estás seguro de que quieres eliminar tu cuenta?');
    if (confirmacion) {
      console.log('Cuenta eliminada');
      this.mostrarNotificacion('Cuenta eliminada');
    }
  }

  eliminarPlan() {
    const confirmacion = confirm('¿Estás seguro de que quieres eliminar tu plan Premium?');
    if (confirmacion) {
      console.log('Plan eliminado');
      this.mostrarNotificacion('Plan eliminado');
    }
  }

  // Mostrar notificaciones
  mostrarNotificacion(mensaje: string, error: boolean = false) {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: error ? ['snack-error'] : ['snack-success'],
    });
  }

  // Getters para manejar los errores en el HTML
  get edad() {
    return this.perfilForm.get('edad');
  }

  get altura() {
    return this.perfilForm.get('altura');
  }

  get sexo() {
    return this.perfilForm.get('sexo');
  }

  get cntTrigliceridos() {
    return this.perfilForm.get('cntTrigliceridos');
  }

  get correo() {
    return this.perfilForm.get('correo');
  }

  get contrasena() {
    return this.perfilForm.get('contrasena');
  }
}
