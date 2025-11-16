import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NutricionistaService, CitaDTO } from '../../service/nutricionista.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-schedule-appointment',
  templateUrl: './programar-cita.html',
  // Asegúrate de que ReactiveFormsModule esté en imports si este es un componente standalone
  imports: [
    ReactiveFormsModule,
    CommonModule // Incluido por si acaso
  ],
  styleUrls: ['./programar-cita.css'],
  standalone: true // Asumo que es un componente standalone
})
export class ProgramarCita implements OnInit {

  appointmentForm!: FormGroup;
  idNutricionista: number | null = null;
  nutricionistaTurno: { inicioTurno: string; finTurno: string } | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private nutricionistaService: NutricionistaService
  ) {}

  async ngOnInit(): Promise<void> {
    this.appointmentForm = this.fb.group({
      dni: ['', [
        Validators.required,
        Validators.pattern(/^\d{8}$/),
        Validators.minLength(8),
        Validators.maxLength(8)
      ]],
      appointmentDate: ['', [
        Validators.required,
        this.futureDateValidator
      ]],
      appointmentTime: ['', [
        Validators.required,
        Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      ]],
      meetingLink: ['', [
        Validators.required,
        Validators.pattern(/^https?:\/\/.+/)
      ]],
      subject: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]]
    });

    try {
      const usuario = await firstValueFrom(this.nutricionistaService.obtenerDatosNutricionista());
      if (!usuario.id) throw new Error('No se encontró ID de usuario');

      const nutricionista = await firstValueFrom(
        this.nutricionistaService.obtenerNutricionistaPorUsuario(usuario.id)
      );

      this.idNutricionista = nutricionista.id ?? null;

      // Cargar turno del nutricionista
      if (nutricionista.idturno) {
        this.nutricionistaTurno = {
          inicioTurno: nutricionista.idturno.inicioTurno,
          finTurno: nutricionista.idturno.finTurno
        };
      }

      console.log("🧑‍⚕️ Nutricionista cargado:", nutricionista);
      console.log("⏰ Turno:", this.nutricionistaTurno);

      // Validar hora en tiempo real cuando cambie
      this.appointmentForm.get('appointmentTime')?.valueChanges.subscribe(() => {
        this.validateAppointmentTime();
      });

    } catch (error) {
      console.error('Error al obtener datos del nutricionista', error);
      this.errorMessage = 'No se pudieron cargar los datos del nutricionista';
    }
  }

  // Validador para fechas futuras
  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const selectedDate = new Date(control.value);
    selectedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate < today ? { pastDate: true } : null;
  }

  // ✅ Validar que la hora esté dentro del turno del nutricionista
  validateAppointmentTime(): void {
    const timeControl = this.appointmentForm.get('appointmentTime');
    const selectedTime = timeControl?.value;

    if (!selectedTime || !this.nutricionistaTurno) return;

    // Comparar solo HH:mm
    const timeValue = selectedTime.substring(0, 5);
    const inicio = this.nutricionistaTurno.inicioTurno.substring(0, 5);
    const fin = this.nutricionistaTurno.finTurno.substring(0, 5);

    if (timeValue < inicio || timeValue > fin) {
      timeControl?.setErrors({
        ...timeControl.errors,
        outsideTurno: true,
        turnoInfo: `Horario: ${inicio} - ${fin}`
      });
    } else {
      // Remover el error de turno si está dentro del rango
      const errors = timeControl?.errors;
      if (errors) {
        delete errors['outsideTurno'];
        delete errors['turnoInfo'];
        const hasErrors = Object.keys(errors).length > 0;
        timeControl?.setErrors(hasErrors ? errors : null);
      }
    }
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    if (this.idNutricionista === null) {
      this.errorMessage = 'Error: no se pudo obtener el ID del nutricionista.';
      return;
    }

    this.isLoading = true;
    const form = this.appointmentForm.value;

    try {
      const dateObject = new Date(form.appointmentDate);
      const year = dateObject.getUTCFullYear();
      const month = (dateObject.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = dateObject.getUTCDate().toString().padStart(2, '0');
      const dia = `${year}-${month}-${day}`;

      const hora = form.appointmentTime.length === 5
        ? form.appointmentTime + ':00'
        : form.appointmentTime;

      // ✅ VALIDACIÓN 1: Buscar paciente
      const paciente = await firstValueFrom(
        this.nutricionistaService.buscarPacientePorDni(form.dni)
      );

      if (!paciente || !paciente.id) {
        this.errorMessage = 'No existe un paciente con ese DNI';
        this.isLoading = false;
        return;
      }

      try {
        const existeCita = await firstValueFrom(
          this.nutricionistaService.verificarDisponibilidad(this.idNutricionista, dia, hora)
        );

        if (existeCita) {
          this.errorMessage = 'Ya tienes una cita registrada para ese día y hora. Por favor, elige otro horario.';
          this.isLoading = false;
          return;
        }
      } catch (error) {
        console.warn('No se pudo verificar disponibilidad:', error);
        // Continuar sin validar (el backend lo validará)
      }

      const cita: CitaDTO = {
        dia,
        hora,
        descripcion: form.subject,
        link: form.meetingLink,
        idPaciente: paciente.id,
        idNutricionista: this.idNutricionista
      };

      console.log("📤 Registrando cita:", cita);

      await firstValueFrom(this.nutricionistaService.registrarCita(cita));

      this.successMessage = '¡Cita registrada correctamente!';
      this.appointmentForm.reset();
      this.isLoading = false;

      setTimeout(() => this.successMessage = '', 5000);

    } catch (error: any) {
      console.error('Error al registrar la cita', error);
      this.isLoading = false;

      if (error?.error?.message) {
        this.errorMessage = error.error.message;
      } else if (error?.message) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'Error al registrar la cita. Intenta nuevamente.';
      }
    }
  }

  // Getters para el template
  get dni() { return this.appointmentForm.get('dni'); }
  get appointmentDate() { return this.appointmentForm.get('appointmentDate'); }
  get appointmentTime() { return this.appointmentForm.get('appointmentTime'); }
  get meetingLink() { return this.appointmentForm.get('meetingLink'); }
  get subject() { return this.appointmentForm.get('subject'); }
}
