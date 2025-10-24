// typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ContactService } from '../service/contact-service';

@Component({
  selector: 'app-centro-de-ayuda',
  templateUrl: './centro-de-ayuda.html',
  styleUrls: ['./centro-de-ayuda.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CentroDeAyuda implements OnInit {
  contactoForm!: FormGroup;
  submitted = false;
  sending = false;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    this.contactoForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mensaje: ['', Validators.required],
      acepto: [false, Validators.requiredTrue]
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.contactoForm.invalid) return;

    this.sending = true;
    this.contactService.sendContactEmail(this.contactoForm.value)
      .then(() => {
        console.log('Correo enviado a Vitalco');
        this.contactoForm.reset();
        this.submitted = false;
      })
      .catch((err: any) => {
        console.error('Error al enviar correo', err);
      })
      .finally(() => {
        this.sending = false;
      });
  }
}
