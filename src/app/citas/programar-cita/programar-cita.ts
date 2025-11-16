// meloliva/vitalco-frontend/VitalCo-Frontend-Melanie/src/app/citas/programar-cita/programar-cita.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { ProgramarCitaService } from '../../service/programar-cita.service';
import { UserService } from '../../service/userlayout-service';
import { NutricionistaDTO, CitaDTO } from '../../service/nutricionista.service';
import { Paciente } from '../../models/paciente.model';
import {link} from 'node:fs';

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

  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private citaService: ProgramarCitaService,
    private userService: UserService
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
      const paciente = await firstValueFrom(this.userService.getUsuarioPaciente()) as Paciente;

      if (!paciente || !paciente.id) {
        throw new Error('No se pudo cargar la información del paciente.');
      }

      this.idPaciente = paciente.id;

      if (paciente.idusuario?.dni) {
        this.appointmentForm.get('dni')?.setValue(paciente.idusuario.dni);
        this.appointmentForm.get('dni')?.disable();
      }

      this.nutricionistas = await firstValueFrom(this.citaService.listarNutricionistas());

      if (!this.nutricionistas || this.nutricionistas.length === 0) {
        this.errorMessage = 'No hay nutricionistas disponibles en este momento.';
      }

    } catch (error: any) {
      console.error('❌ Error al cargar datos iniciales:', error);
      this.errorMessage = error?.error?.message || 'Error al cargar la página. Intente de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Se llama al enviar el formulario.
   */
  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      this.errorMessage = 'Por favor, completa todos los campos requeridos correctamente.';
      return;
    }
    if (this.idPaciente === null) {
      this.errorMessage = 'Error interno: ID de paciente no encontrado.';
      return;
    }

    this.isLoading = true;
    const formValue = this.appointmentForm.getRawValue();

    try {
      const dateObject = new Date(formValue.appointmentDate);
      const dia = `${dateObject.getUTCFullYear()}-${(dateObject.getUTCMonth() + 1).toString().padStart(2, '0')}-${dateObject.getUTCDate().toString().padStart(2, '0')}`;
      const hora = formValue.appointmentTime.length === 5
        ? formValue.appointmentTime + ':00'
        : formValue.appointmentTime;
      const placeholderLink = 'Link pendiente';

      const cita: CitaDTO = {
        dia: dia,
        hora: hora,
        descripcion: formValue.description,
        link: placeholderLink,
        idPaciente: this.idPaciente,
        idNutricionista: parseInt(formValue.nutritionist, 10)
      };

      await firstValueFrom(this.citaService.registrarCita(cita));

      this.successMessage = '¡Cita programada correctamente!';
      this.appointmentForm.reset({
        dni: formValue.dni,
        nutritionist: null,
        appointmentDate: '',
        appointmentTime: '',
        description: ''
      });
      this.appointmentForm.get('dni')?.disable();

    } catch (error: any) {
      console.error('❌ Error al registrar la cita', error);

      // 🚨 AQUÍ ESTÁ LA NUEVA LÓGICA DE CAPTURA DE ERRORES 🚨

      // 1. Verificar si el error tiene el cuerpo `error.error` y `error.error.message`
      if (error && error.error && typeof error.error.message === 'string') {
        const backendMessage = error.error.message;

        // 2. Buscar los mensajes específicos que nos interesan
        if (backendMessage.includes('fuera del turno del nutricionista')) {
          this.errorMessage = 'La hora de la cita está fuera del turno del nutricionista. 😞 Por favor, elige otra hora.';

        } else if (backendMessage.includes('ya tiene una cita en esa fecha y hora')) {
          this.errorMessage = 'El nutricionista ya tiene una cita programada en esa fecha y hora. 🗓️';

        } else if (backendMessage.includes('El paciente ya tiene una cita en esa fecha y hora')) {
          this.errorMessage = 'Ya tienes otra cita programada a esa misma hora.';

        } else {
          // 3. Si no es un error conocido, mostrar el mensaje del backend tal cual
          this.errorMessage = backendMessage;
        }

      } else if (error.status === 401 || error.status === 403) {
        // 4. Manejar errores de autenticación (como los que notamos antes)
        this.errorMessage = 'Error al registrar la cita. Intenta nuevamente más tarde.';

      } else {
        // 5. Error genérico si no podemos leer el mensaje
        this.errorMessage = 'Error al registrar la cita. Intenta nuevamente más tarde.';
      }

    } finally {
      this.isLoading = false;
      // Ocultar mensajes después de unos segundos
      setTimeout(() => this.successMessage = '', 5000);
      setTimeout(() => this.errorMessage = '', 8000);
    }
  }

  // Getters para validación en el HTML
  get dni() { return this.appointmentForm.get('dni'); }
  get nutritionist() { return this.appointmentForm.get('nutritionist'); }
  get appointmentDate() { return this.appointmentForm.get('appointmentDate'); }
  get appointmentTime() { return this.appointmentForm.get('appointmentTime'); }
  get description() { return this.appointmentForm.get('description'); }

  get link() { return this.appointmentForm.get('link'); }
}
