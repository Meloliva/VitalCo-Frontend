import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Appointment {
  dni: string;
  appointmentDate: string;
  appointmentTime: string;
  meetingLink: string;
  subject: string;
}

@Component({
  selector: 'app-programar',
  templateUrl: './programar.html',
  styleUrls: ['./programar.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class Programar implements OnInit {
  appointmentForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.appointmentForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
      meetingLink: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)/)]],
      subject: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      const newAppointment: Appointment = this.appointmentForm.value;
      console.log('Cita programada:', newAppointment);
      alert('✅ ¡Cita programada con éxito!');
      this.appointmentForm.reset({
        dni: '',
        appointmentDate: null,
        appointmentTime: null,
        meetingLink: '',
        subject: ''
      });
    } else {
      this.appointmentForm.markAllAsTouched();
      alert('⚠️ Por favor, complete todos los campos correctamente.');
    }
  }
}
