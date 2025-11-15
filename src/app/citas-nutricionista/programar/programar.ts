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

  // Igual que en PerfilNutricionistaComponent
  idNutricionista: number | null = null;

  constructor(
    private fb: FormBuilder,
    private nutricionistaService: NutricionistaService
  ) {}

  async ngOnInit(): Promise<void> {

    // Inicializar el formulario inmediatamente
    this.appointmentForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
      meetingLink: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)/)]],
      subject: ['', Validators.required]
    });

    // Luego haces tus llamados async
    const usuario = await firstValueFrom(
      this.nutricionistaService.obtenerDatosNutricionista()
    );

    if (!usuario.id) {
      console.error("❌ No se encontró ID de usuario autenticado");
      return;
    }

    const nutricionista = await firstValueFrom(
      this.nutricionistaService.obtenerNutricionistaPorUsuario(usuario.id)
    );

    console.log("🧑‍⚕️ Datos del nutricionista cargados:", nutricionista);

    this.idNutricionista = nutricionista.id ?? null;
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

    try {
      const form = this.appointmentForm.value;

      // 1️⃣ Buscar paciente por DNI
      const paciente = await firstValueFrom(
        this.nutricionistaService.buscarPacientePorDni(form.dni)
      );

      if (!paciente) {
        alert('❌ No existe un paciente con ese DNI');
        return;
      }

      // 2️⃣ Construcción segura de la cita
      const cita: CitaDTO = {
        dia: form.appointmentDate,
        hora: form.appointmentTime.length === 5 ? form.appointmentTime + ':00' : form.appointmentTime,
        descripcion: form.subject,
        estado: 'Reservado',
        link: form.meetingLink,
        idPaciente: paciente.id,
        idNutricionista: this.idNutricionista
      };

      console.log("📤 Enviando cita:", cita);

      // 3️⃣ Registrar cita
      await firstValueFrom(this.nutricionistaService.registrarCita(cita));

      alert('✅ ¡Cita registrada correctamente!');
      this.appointmentForm.reset();

    } catch (error) {
      console.error(error);
      alert('❌ Error al registrar la cita');
    }
  }
}
