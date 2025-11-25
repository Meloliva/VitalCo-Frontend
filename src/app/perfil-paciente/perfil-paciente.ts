import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule, isPlatformBrowser } from '@angular/common'; // <-- Importar isPlatformBrowser
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core'; // <-- Importar Inject y PLATFORM_ID
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
  fotoPerfilUrl: string = '';

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private perfilPacienteService: PerfilPacienteService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // <-- Inyección necesaria para detectar navegador
  ) {}

  ngOnInit(): void {
    this.iniciarFormulario();

    // 🛡️ CORRECCIÓN CRÍTICA:
    // Solo cargamos los datos si estamos en el NAVEGADOR.
    // En el servidor (SSR) no tenemos token, así que no tiene sentido llamar a la API.
    if (isPlatformBrowser(this.platformId)) {
      this.cargarPerfilPaciente();
    }
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
        this.fotoPerfilUrl = paciente.idusuario.fotoPerfil || '/Images/iconos/iconoSistemas/image 18.png';

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

        // Si falla en el navegador, ahí sí manejamos el logout
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
    // 🛡️ CORRECCIÓN: Protección para no romper el servidor si esto se llama por error
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
    console.log('Cambiando foto...');
  }

  guardarCambios() {
    if (this.perfilForm.invalid) {
      this.mostrarNotificacion('Por favor, corrige los errores del formulario', true);
      return;
    }

    const formValues = this.perfilForm.value;
    const dto: EditarPaciente = { id: this.pacienteId };

    if (formValues.edad != null && formValues.edad !== this.datosOriginales.edad) dto.edad = Number(formValues.edad);
    if (formValues.altura != null && formValues.altura !== this.datosOriginales.altura) dto.altura = Number(formValues.altura);
    if (formValues.cntTrigliceridos != null && formValues.cntTrigliceridos !== this.datosOriginales.cntTrigliceridos) dto.trigliceridos = Number(formValues.cntTrigliceridos);
    if (formValues.peso != null && formValues.peso !== this.datosOriginales.peso) dto.peso = Number(formValues.peso);
    if (formValues.correo && formValues.correo.trim() !== this.datosOriginales.correo) dto.correo = formValues.correo.trim();
    if (formValues.contrasena && formValues.contrasena.trim() !== '') dto.contraseña = formValues.contrasena.trim();

    if (Object.keys(dto).length === 1) {
      this.mostrarNotificacion('No hay cambios para guardar');
      return;
    }

    this.perfilPacienteService.editarPaciente(dto).subscribe({
      next: (paciente) => {
        this.mostrarNotificacion('Cambios guardados exitosamente!');
        if (paciente.idusuario.fotoPerfil) {
          this.fotoPerfilUrl = paciente.idusuario.fotoPerfil;
        }
        this.datosOriginales = {
          correo: paciente.idusuario?.correo || this.datosOriginales.correo,
          edad: paciente.edad || this.datosOriginales.edad,
          altura: paciente.altura || this.datosOriginales.altura,
          cntTrigliceridos: paciente.trigliceridos || this.datosOriginales.cntTrigliceridos,
          peso: paciente.peso || this.datosOriginales.peso,
        };
        this.perfilForm.patchValue({ contrasena: '' });
      },
      error: (err) => {
        let mensajeError = 'Error al guardar los cambios';
        if (err.error?.message) mensajeError += ': ' + err.error.message;
        this.mostrarNotificacion(mensajeError, true);
      }
    });
  }

  eliminarCuenta() {
    if (confirm('¿Estás seguro de que quieres eliminar tu cuenta?')) {
      this.perfilPacienteService.eliminarUsuario().subscribe({
        next: () => {
          this.mostrarNotificacion('Cuenta eliminada exitosamente');
          if (isPlatformBrowser(this.platformId)) {
            this.userService.clearUser();
            localStorage.removeItem('token');
            localStorage.removeItem('roles');
            localStorage.removeItem('userRole');
          }
          setTimeout(() => { this.router.navigate(['/inicio']); }, 1500);
        },
        error: (err) => {
          this.mostrarNotificacion('Error al eliminar la cuenta', true);
        }
      });
    }
  }

  eliminarPlan() {
    if (confirm('¿Estás seguro de que quieres eliminar tu plan Premium?')) {
      this.mostrarNotificacion('Plan eliminado');
    }
  }

  mostrarNotificacion(mensaje: string, error: boolean = false) {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: error ? ['snack-error'] : ['snack-success'],
    });
  }

  // Getters
  get edad() { return this.perfilForm.get('edad'); }
  get altura() { return this.perfilForm.get('altura'); }
  get sexo() { return this.perfilForm.get('sexo'); }
  get cntTrigliceridos() { return this.perfilForm.get('cntTrigliceridos'); }
  get correo() { return this.perfilForm.get('correo'); }
  get contrasena() { return this.perfilForm.get('contrasena'); }
  get peso() { return this.perfilForm.get('peso'); }
}
