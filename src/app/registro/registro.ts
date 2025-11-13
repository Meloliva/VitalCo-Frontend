import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NutricionistaService, RolDTO, TurnoDTO } from '../service/nutricionista.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatProgressBarModule
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro implements OnInit {
  step = signal(1);
  registroForm: FormGroup;
  registroProfesionalForm: FormGroup;
  showPassword: boolean = false;
  progressValue: number = 33;

  // Variables para almacenar datos del backend
  roles: RolDTO[] = [];
  turnos: TurnoDTO[] = [];
  idRolNutricionista: number | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private nutricionistaService: NutricionistaService
  ) {
    // Formulario paso 1
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      genero: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Formulario paso 2
    this.registroProfesionalForm = this.fb.group({
      asociacion: ['', Validators.required],
      universidad: ['', Validators.required],
      turno: ['', Validators.required],
      gradoAcademico: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {
    this.isLoading = true;

    // Cargar roles
    this.nutricionistaService.listarRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        const rolNutri = roles.find(r => r.tipo.toUpperCase() === 'NUTRICIONISTA');
        if (rolNutri) {
          this.idRolNutricionista = rolNutri.id;
        } else {
          console.error('No se encontró el rol NUTRICIONISTA');
        }
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.errorMessage = 'Error al cargar roles del sistema';
      }
    });

    // Cargar turnos
    this.nutricionistaService.listarTurnos().subscribe({
      next: (turnos) => {
        this.turnos = turnos;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar turnos:', error);
        this.errorMessage = 'Error al cargar turnos disponibles';
        this.isLoading = false;
      }
    });
  }

  nextStep() {
    if (this.step() === 1 && this.registroForm.valid) {
      this.step.set(2);
      this.progressValue = 66;
    } else if (this.step() === 2 && this.registroProfesionalForm.valid) {
      this.registrarNutricionista();
    }
  }

  registrarNutricionista() {
    if (!this.idRolNutricionista) {
      alert('Error: No se pudo obtener el rol de nutricionista');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Datos del paso 1 (usuario)
    const datosUsuario = {
      dni: this.registroForm.value.dni,
      contraseña: this.registroForm.value.password,
      nombre: this.registroForm.value.nombre,
      apellido: this.registroForm.value.apellido,
      correo: this.registroForm.value.correo,
      genero: this.registroForm.value.genero,
      rol: { id: this.idRolNutricionista, tipo: 'NUTRICIONISTA' },
      estado: 'Activo'
    };

    // Paso 1: Registrar usuario
    this.nutricionistaService.registrarUsuario(datosUsuario).subscribe({
      next: (usuarioCreado) => {
        console.log('Usuario creado:', usuarioCreado);

        // Guardamos referencia local
        const usuarioTemporal = usuarioCreado;

        // Paso 2: login automático para obtener token
        this.nutricionistaService.login({
          correo: this.registroForm.value.correo,
          contraseña: this.registroForm.value.password
        }).subscribe({
          next: (loginResponse) => {
            const token = loginResponse.token;
            if (token) {
              localStorage.setItem('token', token);
              console.log('✅ Token guardado correctamente');
            } else {
              console.warn('⚠️ No se recibió token del backend');
            }

            // Paso 3: Registrar nutricionista
            const turnoSeleccionado = this.turnos.find(
              t => t.id === parseInt(this.registroProfesionalForm.value.turno)
            );

            if (!turnoSeleccionado) {
              this.errorMessage = 'Error: Turno no válido';
              this.isLoading = false;
              return;
            }

            const datosNutricionista = {
              idusuario: usuarioTemporal, // 🔹 usamos la variable guardada
              asociaciones: this.registroProfesionalForm.value.asociacion,
              universidad: this.registroProfesionalForm.value.universidad,
              gradoAcademico: this.registroProfesionalForm.value.gradoAcademico,
              idturno: turnoSeleccionado
            };

            this.nutricionistaService.registrarNutricionista(datosNutricionista).subscribe({
              next: (nutricionistaCreado) => {
                console.log('Nutricionista creado:', nutricionistaCreado);
                this.isLoading = false;
                this.step.set(3);
                this.progressValue = 100;
              },
              error: (error) => {
                console.error('Error al registrar nutricionista:', error);
                this.errorMessage = error.error?.message || 'Error al completar el registro profesional';
                this.isLoading = false;
                alert(this.errorMessage);
              }
            });
          },
          error: (error) => {
            console.error('Error al iniciar sesión automáticamente:', error);
            this.errorMessage = 'Error al iniciar sesión automáticamente';
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error al registrar usuario:', error);
        this.errorMessage = error.error?.message || 'Error al registrar usuario';
        this.isLoading = false;
        alert(this.errorMessage);
      }
    });
  }

  goBack() {
    if (this.step() === 2) {
      this.step.set(1);
      this.progressValue = 33;
    } else if (this.step() === 3) {
      this.step.set(2);
      this.progressValue = 66;
    }
  }

  iniciar() {
    this.router.navigate(['/nutricionista/perfil']);
  }

  cancelar() {
    this.router.navigate(['/inicio']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
