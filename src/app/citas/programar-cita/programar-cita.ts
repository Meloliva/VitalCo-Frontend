import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Necesario para componentes standalone si se usa el template en otro archivo

// 1. Interfaz
interface Appointment {
  dni: string;
  nutritionist: string;
  appointmentDate: string;
  appointmentTime: string;
  description: string;
}

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

  // Se inyecta el FormBuilder (fb) para construir el formulario
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  // Método para inicializar o resetear el formulario a sus valores iniciales
  initializeForm(): void {
    this.appointmentForm = this.fb.group({
      // DNI: Requerido y patrón de 8 dígitos
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],

      // Nutricionista: Requerido
      nutritionist: ['', Validators.required],

      // Fecha y Hora: Requeridos
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],

      // Descripción: Opcional
      description: ['']
    });
  }

  // Método que se llama al enviar el formulario (desde el ngSubmit)
  onSubmit(): void {
    // Se comprueba si el formulario es válido
    if (this.appointmentForm.valid) {

      const newAppointment: Appointment = this.appointmentForm.value;
      console.log('Cita programada con datos válidos:', newAppointment);

      // 🚨 Muestra el mensaje de éxito (simulando tu modal o alert)
      // Nota: Idealmente se usaría un componente modal personalizado aquí.
      alert('¡Cita programada con éxito!');

      // 🚨 CORRECCIÓN: Usamos null para los campos de fecha/hora para un reseteo más limpio 🚨
      this.appointmentForm.reset({
        dni: '',
        nutritionist: '',
        appointmentDate: null, // Cambiado de '' a null
        appointmentTime: null, // Cambiado de '' a null
        description: ''
      });

      // La llamada a alert() bloquea la ejecución. Cuando el usuario presiona "Aceptar"
      // la ejecución se reanuda y se ejecuta el reset().

    } else {

      // Si es inválido, se marcan todos los campos como "tocados" para mostrar errores.
      this.appointmentForm.markAllAsTouched();
      console.log('Formulario inválido. Revisa los campos.');
      // Utilizamos alert() como fallback para simular tu mensaje de error
      alert('Por favor, completa todos los campos requeridos correctamente.');
    }
  }
}
