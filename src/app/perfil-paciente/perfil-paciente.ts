import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../service/userlayout-service';
import { Usuario } from '../models/usuario.model';
import { Paciente } from '../models/paciente.model';
import { Nutricionista } from '../models/nutricionista.model';
import { PerfilPacienteService } from '../service/perfil-paciente.service';
import { EditarPaciente } from '../models/editar-paciente.model';
import {Router} from '@angular/router';

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
  datosOriginales: any = {}; // ✅ Guardar valores originales

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private perfilPacienteService: PerfilPacienteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.iniciarFormulario();
    this.cargarPerfilPaciente();
  }

  iniciarFormulario() {
    this.perfilForm = this.fb.group({
      edad: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      altura: ['', [Validators.required, Validators.min(0.5), Validators.max(2.5)]],
      sexo: [{value: '', disabled: true}],
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
        console.log('🆔 Paciente ID:', this.pacienteId);

        // ✅ Guardar valores originales
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
        this.mostrarNotificacion('Error al cargar los datos del paciente', true);
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

  cambiarFoto() {
    console.log('Cambiando foto...');
  }

  guardarCambios() {
    if (this.perfilForm.invalid) {
      this.mostrarNotificacion('Por favor, corrige los errores del formulario', true);
      return;
    }

    const formValues = this.perfilForm.value;

    // ✅ Construir DTO solo con campos que cambiaron
    const dto: EditarPaciente = {
      id: this.pacienteId,
    };

    // ✅ Solo agregar campos que cambiaron
    if (formValues.edad != null && formValues.edad !== this.datosOriginales.edad) {
      dto.edad = Number(formValues.edad);
    }

    if (formValues.altura != null && formValues.altura !== this.datosOriginales.altura) {
      dto.altura = Number(formValues.altura);
    }

    if (formValues.cntTrigliceridos != null && formValues.cntTrigliceridos !== this.datosOriginales.cntTrigliceridos) {
      dto.trigliceridos = Number(formValues.cntTrigliceridos);
    }

    if (formValues.peso != null && formValues.peso !== this.datosOriginales.peso) {
      dto.peso = Number(formValues.peso);
    }

    if (formValues.correo && formValues.correo.trim() !== this.datosOriginales.correo) {
      dto.correo = formValues.correo.trim();
    }

    // ✅ Contraseña solo si se escribió algo
    if (formValues.contrasena && formValues.contrasena.trim() !== '') {
      dto.contraseña = formValues.contrasena.trim();
    }

    console.log('📦 DTO enviado (solo campos modificados):', dto);

    // ✅ Si no hay cambios, no hacer la petición
    if (Object.keys(dto).length === 1) { // Solo tiene 'id'
      this.mostrarNotificacion('No hay cambios para guardar');
      return;
    }

    this.perfilPacienteService.editarPaciente(dto).subscribe({
      next: (paciente) => {
        console.log('✅ Paciente actualizado:', paciente);
        this.mostrarNotificacion('Cambios guardados exitosamente!');

        // ✅ Actualizar datos originales con los nuevos valores
        this.datosOriginales = {
          correo: paciente.idusuario?.correo || this.datosOriginales.correo,
          edad: paciente.edad || this.datosOriginales.edad,
          altura: paciente.altura || this.datosOriginales.altura,
          cntTrigliceridos: paciente.trigliceridos || this.datosOriginales.cntTrigliceridos,
          peso: paciente.peso || this.datosOriginales.peso,
        };

        // ✅ Limpiar campo de contraseña
        this.perfilForm.patchValue({ contrasena: '' });
      },
      error: (err) => {
        console.error('❌ Error al guardar cambios:', err);
        console.error('❌ Detalle del error:', err.error);

        let mensajeError = 'Error al guardar los cambios';
        if (err.error?.message) {
          mensajeError += ': ' + err.error.message;
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
          console.log('✅ Cuenta eliminada');
          this.mostrarNotificacion('Cuenta eliminada exitosamente');
          // ✅ Limpiar localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('roles');
          localStorage.removeItem('userRole');
          setTimeout(() => {
            this.router.navigate(['/inicio']);
          }, 1500);
        },
        error: (err) => {
          console.error('❌ Error al eliminar cuenta:', err);
          this.mostrarNotificacion('Error al eliminar la cuenta', true);
        }
      });
    }
  }

  eliminarPlan() {
    const confirmacion = confirm('¿Estás seguro de que quieres eliminar tu plan Premium?');
    if (confirmacion) {
      console.log('Plan eliminado');
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

