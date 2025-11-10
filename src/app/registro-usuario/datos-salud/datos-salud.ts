import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatProgressBar } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { RegistroSharedService } from '../../service/registro-shared.service';

@Component({
  selector: 'app-datos-salud',
  standalone: true,
  templateUrl: './datos-salud.html',
  styleUrls: ['./datos-salud.css'],
  imports: [ReactiveFormsModule, MatProgressBar, CommonModule]
})
export class DatosSaludComponent implements OnInit {
  datosSaludForm!: FormGroup;
  progressValue = 0;

  constructor(
    private fb: FormBuilder,
    private registroShared: RegistroSharedService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.registroShared.progress$.subscribe(progress => this.progressValue = progress);
  }

  initForm(): void {
    this.datosSaludForm = this.fb.group({
      altura: ['', [Validators.required, Validators.min(0.5), Validators.max(3)]],
      peso: ['', [Validators.required, Validators.min(20), Validators.max(300)]],
      edad: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      trigliceridos: ['', [Validators.required, Validators.min(0)]]
    });
  }

  goBack(): void {
    this.router.navigate(['/registro-usuario']);
  }

  onSubmit(): void {
    if (this.datosSaludForm.invalid) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }

    const datosSalud = this.datosSaludForm.value;
    this.registroShared.guardarDatosSalud(datosSalud);
    this.router.navigate(['/objetivo']);
  }
}
