import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Importar Router
import { firstValueFrom } from 'rxjs';

import { ProgramarCitaService } from '../../service/programar-cita.service';
import { UserService } from '../../service/userlayout-service';
import { NutricionistaDTO, CitaDTO } from '../../service/nutricionista.service';
import { Paciente } from '../../models/paciente.model';

@Component({
  selector: 'app-schedule-appointment',
  templateUrl: './programar-cita.html',
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  styleUrls: ['./programar-cita.css'],
  standalone: true
})
export class ProgramarCita implements OnInit {

  appointmentForm: FormGroup;
  nutricionistas: NutricionistaDTO[] = [];
  idPaciente: number | null = null;

  // Variables para edición
  esEdicion: boolean = false;
  idCitaEditar: number | null = null;

  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private citaService: ProgramarCitaService,
    private userService: UserService,
    private router: Router // Inyectamos Router para recibir datos
  ) {
    this.appointmentForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      nutritionist: [null, [Validators.required, Validators.min(1)]],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      link: ['', [Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)]]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      // 1. Cargar datos del Paciente (DNI)
      const paciente = await firstValueFrom(this.userService.getUsuarioPaciente()) as Paciente;
      if (!paciente || !paciente.id) { throw new Error('No se pudo cargar la información del paciente.'); }

      this.idPaciente = paciente.id;
      if (paciente.idusuario?.dni) {
        this.appointmentForm.get('dni')?.setValue(paciente.idusuario.dni);
        this.appointmentForm.get('dni')?.disable();
      }

      // 2. Cargar lista de Nutricionistas
      this.nutricionistas = await firstValueFrom(this.citaService.listarNutricionistas());

      // 3. VERIFICAR SI ES EDICIÓN (Recuperar datos del estado)
      const navegacion = this.router.getCurrentNavigation(); // Funciona en constructor, pero history.state funciona siempre
      const state = history.state;

      if (state && state.datosCita) {
        this.esEdicion = true;
        const cita = state.datosCita;
        this.idCitaEditar = cita.id;

        console.log('Modo Edición activado. Datos recibidos:', cita);

        // Rellenar formulario
        this.appointmentForm.patchValue({
          nutritionist: cita.idNutricionista, // Asegúrate que el select use ID
          appointmentDate: cita.dia,          // Formato YYYY-MM-DD
          appointmentTime: cita.hora ? cita.hora.substring(0, 5) : '', // Cortar segundos HH:mm:ss -> HH:mm
          description: cita.descripcion,
          link: cita.link
        });
      }

    } catch (error: any) {
      console.error('❌ Error al cargar datos iniciales:', error);
      this.errorMessage = error?.error?.message || 'Error al cargar la página.';
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      this.errorMessage = 'Por favor, completa todos los campos requeridos.';
      return;
    }

    this.isLoading = true;
    const formValue = this.appointmentForm.getRawValue();

    try {
      const dateObject = new Date(formValue.appointmentDate);
      // Ajuste de fecha para evitar problemas de zona horaria (UTC)
      const dia = formValue.appointmentDate;

      // Formatear hora
      const hora = formValue.appointmentTime.length === 5
        ? formValue.appointmentTime + ':00'
        : formValue.appointmentTime;

      const linkToSend = formValue.link ? formValue.link : '';

      // Construir objeto DTO
      const cita: CitaDTO = {
        dia: dia,
        hora: hora,
        descripcion: formValue.description,
        link: linkToSend,
        idPaciente: this.idPaciente!,
        idNutricionista: parseInt(formValue.nutritionist, 10)
      };

      if (this.esEdicion && this.idCitaEditar) {
        // --- MODO ACTUALIZAR ---
        cita.id = this.idCitaEditar; // Importante: enviar el ID
        await firstValueFrom(this.citaService.actualizarCita(cita));
        this.successMessage = '¡Cita reprogramada exitosamente!';
        // Opcional: redirigir de vuelta al listado después de unos segundos
        // setTimeout(() => this.router.navigate(['/sistema/citas/listar']), 2000);
      } else {
        // --- MODO REGISTRAR ---
        await firstValueFrom(this.citaService.registrarCita(cita));
        this.successMessage = '¡Cita programada correctamente!';
        this.appointmentForm.reset({ dni: formValue.dni }); // Limpiar excepto DNI
      }

    } catch (error: any) {
      console.error('❌ Error en la operación', error);
      const backendMessage = error.error?.message || '';

      if (backendMessage.includes('fuera del turno')) {
        this.errorMessage = 'El horario elegido está fuera del turno del nutricionista.';
      } else if (backendMessage.includes('ya tiene una cita')) {
        this.errorMessage = 'Ya existe una cita programada en ese horario.';
      } else {
        this.errorMessage = backendMessage || 'Error al procesar la cita. Intente nuevamente.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  // Getters
  get dni() { return this.appointmentForm.get('dni'); }
  get nutritionist() { return this.appointmentForm.get('nutritionist'); }
  get appointmentDate() { return this.appointmentForm.get('appointmentDate'); }
  get appointmentTime() { return this.appointmentForm.get('appointmentTime'); }
  get description() { return this.appointmentForm.get('description'); }
  get link() { return this.appointmentForm.get('link'); }
}
