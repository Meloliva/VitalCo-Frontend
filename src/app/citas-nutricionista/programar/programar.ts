import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NutricionistaService, CitaDTO } from '../../service/nutricionista.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-programar',
  templateUrl: './programar.html',
  styleUrls: ['./programar.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class Programar implements OnInit {

  appointmentForm!: FormGroup;
  idNutricionista: number | null = null;

  constructor(
    private fb: FormBuilder,
    private nutricionistaService: NutricionistaService
  ) {}

  async ngOnInit(): Promise<void> {
    // Inicializar formulario
    this.appointmentForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
      meetingLink: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)/)]],
      subject: ['', Validators.required]
    });

    try {
      // Obtener ID del nutricionista
      const usuario = await firstValueFrom(this.nutricionistaService.obtenerDatosNutricionista());
      if (!usuario.id) throw new Error('No se encontró ID de usuario');

      const nutricionista = await firstValueFrom(
        this.nutricionistaService.obtenerNutricionistaPorUsuario(usuario.id)
      );

      this.idNutricionista = nutricionista.id ?? null;
      console.log("🧑‍⚕️ Nutricionista cargado:", nutricionista);

    } catch (error) {
      console.error('Error al obtener datos del nutricionista', error);
      alert('❌ No se pudieron cargar los datos del nutricionista');
    }
  }

  async onSubmit(): Promise<void> {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      alert('⚠️ Complete todos los campos.');
      return;
    }

    if (this.idNutricionista === null) {
      alert('❌ Error: no se pudo obtener el ID del nutricionista.');
      return;
    }

    const form = this.appointmentForm.value;

    try {
      // Formatear fecha a YYYY-MM-DD
      const fecha = new Date(form.appointmentDate);
      const fechaStr = fecha.toISOString().split('T')[0];

      // Buscar paciente por DNI
      const paciente = await firstValueFrom(this.nutricionistaService.buscarPacientePorDni(form.dni));
      if (!paciente || !paciente.id) {
        alert('❌ No existe un paciente con ese DNI');
        return;
      }

      // Construir CitaDTO
      const cita: CitaDTO = {
        dia: fechaStr,
        hora: form.appointmentTime.length === 5 ? form.appointmentTime + ':00' : form.appointmentTime,
        descripcion: form.subject,
        estado: 'Reservado',
        link: form.meetingLink,
        idPaciente: paciente.id,
        idNutricionista: this.idNutricionista
      };

      console.log('📤 Registrando cita:', cita);

      // Registrar cita en backend
      await firstValueFrom(this.nutricionistaService.registrarCita(cita));
      alert('✅ ¡Cita registrada correctamente!');
      this.appointmentForm.reset();

    } catch (error: any) {
      console.error('Error al registrar la cita', error);
      alert('❌ Error al registrar la cita: ' + (error?.error?.message || error.message));
    }
  }
}
