import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../service/userlayout-service';
import { Usuario } from '../models/usuario.model';
import { Paciente } from '../models/paciente.model';
import { PerfilPacienteService } from '../service/perfil-paciente.service';
import { EditarPaciente } from '../models/editar-paciente.model';
import { Router } from '@angular/router';

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
  perfilForm!: FormGroup;
  planActual: string = 'Gratuito';
  pacienteId!: number;
  datosOriginales: any = {};
  fotoPerfilUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private perfilPacienteService: PerfilPacienteService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.iniciarFormulario();

    if (isPlatformBrowser(this.platformId)) {
      this.cargarPerfilPaciente();
    }
  }

  iniciarFormulario() {
    this.perfilForm = this.fb.group({
      edad: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      altura: ['', [Validators.required, Validators.min(0.5), Validators.max(2.5)]],
      sexo: [{ value: '', disabled: true }],
      cntTrigliceridos: ['', [Validators.required, Validators.min(1)]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.minLength(6)]],
      peso: ['', [Validators.required, Validators.min(1)]],
    });
  }

  private cargarPerfilPaciente(): void {
    this.userService.getUsuarioPaciente().subscribe({
      next: (paciente: Paciente) => {
        console.log('✅ Perfil paciente cargado:', paciente);
        this.pacienteId = paciente.id;
        this.fotoPerfilUrl = paciente.idusuario.fotoPerfil || null;

        this.datosOriginales = {
          correo: paciente.idusuario.correo || '',
          edad: paciente.edad || null,
          altura: paciente.altura || null,
          cntTrigliceridos: paciente.trigliceridos || null,
          peso: paciente.peso || null,
        };

        this.perfilForm.patchValue({
          correo: this.datosOriginales.correo,
          sexo: this.normalizarGenero(paciente.idusuario.genero),
          edad: this.datosOriginales.edad,
          altura: this.datosOriginales.altura,
          cntTrigliceridos: this.datosOriginales.cntTrigliceridos,
          peso: this.datosOriginales.peso,
        });

        const tipoPlan = paciente.idplan.tipo;
        this.planActual = tipoPlan ? tipoPlan.replace('Plan ', '') : 'Free';
      },
      error: (err) => {
        console.error('❌ Error al cargar el perfil del paciente:', err);

        if (err.status === 403 || err.status === 401 || err.status === 0) {
          this.mostrarNotificacion('Sesión expirada. Por favor, inicia sesión nuevamente.', true);
          this.eliminarTokenYLlevarAInicio();
        } else {
          this.mostrarNotificacion('Error al cargar los datos del paciente', true);
        }
      },
    });
  }

  private eliminarTokenYLlevarAInicio(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.userService.clearUser();
      localStorage.removeItem('token');
    }
    this.router.navigate(['/iniciarsesion']);
  }

  private normalizarGenero(genero: string | undefined): string {
    if (!genero) return '';
    const g = genero.toLowerCase();
    if (g === 'masculino') return 'Masculino';
    if (g === 'femenino') return 'Femenino';
    if (g === 'otro') return 'Otro';
    return '';
  }

  cambiarFoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.subirFoto(file);
      }
    };

    input.click();
  }

  private subirFoto(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      this.mostrarNotificacion('La imagen no debe superar 5MB', true);
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.mostrarNotificacion('Solo se permiten imágenes', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const fotoBase64 = reader.result as string;

      this.fotoPerfilUrl = fotoBase64;
      this.cdr.detectChanges();

      console.log('🔥 PERFIL: Guardando en localStorage');
      localStorage.setItem('userAvatar', fotoBase64);

      console.log('🔥 PERFIL: Disparando evento avatarChanged');
      window.dispatchEvent(new Event('avatarChanged'));

      this.actualizarFotoPerfil(fotoBase64);
    };
    reader.onerror = () => {
      this.mostrarNotificacion('Error al leer la imagen', true);
    };
    reader.readAsDataURL(file);
  }

  private actualizarFotoPerfil(fotoUrl: string) {
    const dto: EditarPaciente = {
      id: this.pacienteId,
      fotoPerfil: fotoUrl,
    };

    console.log('📸 Actualizando foto de perfil...');

    this.perfilPacienteService.editarPaciente(dto).subscribe({
      next: (paciente) => {
        console.log('✅ Foto actualizada en el servidor:', paciente);
        this.mostrarNotificacion('Foto actualizada exitosamente!');
      },
      error: (err) => {
        console.error('❌ Error al actualizar foto:', err);
        this.mostrarNotificacion('Error al actualizar la foto', true);
        this.cargarPerfilPaciente();
      },
    });
  }

  guardarCambios() {
    if (this.perfilForm.invalid) {
      this.mostrarNotificacion('Por favor, corrige los errores del formulario', true);
      return;
    }

    const formValues = this.perfilForm.value;
    const dto: EditarPaciente = { id: this.pacienteId };

    // Helper para limpiar números
    const limpiarNumero = (valor: any): number | undefined => {
      if (valor === null || valor === undefined || valor === '') return undefined;
      const strVal = String(valor).replace(',', '.');
      const num = Number(strVal);
      return isNaN(num) ? undefined : num;
    };

    // 1. Preparamos el DTO con los cambios
    const nuevaEdad = limpiarNumero(formValues.edad);
    if (nuevaEdad && nuevaEdad !== this.datosOriginales.edad) dto.edad = nuevaEdad;

    const nuevaAltura = limpiarNumero(formValues.altura);
    if (nuevaAltura && nuevaAltura !== this.datosOriginales.altura) dto.altura = nuevaAltura;

    const nuevoTrig = limpiarNumero(formValues.cntTrigliceridos);
    if (nuevoTrig && nuevoTrig !== this.datosOriginales.cntTrigliceridos) dto.trigliceridos = nuevoTrig;

    const nuevoPeso = limpiarNumero(formValues.peso);
    if (nuevoPeso && nuevoPeso !== this.datosOriginales.peso) dto.peso = nuevoPeso;

    if (formValues.correo && formValues.correo.trim() !== this.datosOriginales.correo) {
      dto.correo = formValues.correo.trim();
    }

    if (formValues.contrasena && formValues.contrasena.trim() !== '') {
      dto.contraseña = formValues.contrasena.trim();
    }

    if (Object.keys(dto).length <= 1) {
      this.mostrarNotificacion('No hay cambios para guardar');
      return;
    }

    // 2. Enviamos al Backend
    this.perfilPacienteService.editarPaciente(dto).subscribe({
      next: (pacienteRespuesta) => {
        this.mostrarNotificacion('¡Cambios guardados exitosamente!');

        // --- CORRECCIÓN CLAVE AQUÍ ---
        // Actualizamos datosOriginales combinando lo que teníamos + LO QUE ENVIAMOS (dto).
        // Así aseguramos que se guarde el 47 aunque el backend devuelva el objeto viejo.
        this.datosOriginales = {
          ...this.datosOriginales, // Mantenemos lo que había
          ...dto,                  // Sobrescribimos con los cambios nuevos (edad, altura, etc.)

          // Solo si el backend devolvió algo útil extra (como la foto o correo actualizado), lo usamos:
          correo: pacienteRespuesta.idusuario?.correo || dto.correo || this.datosOriginales.correo
        };

        // Limpiamos contraseña
        this.perfilForm.patchValue({ contrasena: '' });
      },
      error: (err) => {
        console.error('Error detallado:', err);
        let mensajeError = 'Error al guardar los cambios';
        if (err.error) {
          if (err.error.message) mensajeError = err.error.message;
          else if (err.error.errors) mensajeError = err.error.errors[0];
        }
        this.mostrarNotificacion(mensajeError, true);
      }
    });
  }

  eliminarCuenta() {
    const confirmacion = confirm('¿Estás seguro de que quieres eliminar tu cuenta?');
    if (confirmacion) {
      this.perfilPacienteService.eliminarUsuario().subscribe({
        next: () => {
          this.mostrarNotificacion('Cuenta eliminada exitosamente');
          if (isPlatformBrowser(this.platformId)) {
            this.userService.clearUser();
            localStorage.removeItem('token');
            localStorage.removeItem('roles');
            localStorage.removeItem('userRole');
          }
          setTimeout(() => {
            this.router.navigate(['/inicio']);
          }, 1500);
        },
        error: (err) => {
          this.mostrarNotificacion('Error al eliminar la cuenta', true);
        },
      });
    }
  }

  eliminarPlan() {
    const confirmacion = confirm('¿Estás seguro de que quieres eliminar tu plan Premium?');
    if (confirmacion) {
      this.mostrarNotificacion('Plan eliminado');
    }
  }

  mostrarNotificacion(mensaje: string, error: boolean = false) {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: error ? ['snack-error'] : ['snack-success'],
    });
  }

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

  get peso() {
    return this.perfilForm.get('peso');
  }
}
