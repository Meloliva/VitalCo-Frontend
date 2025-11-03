import { Component, LOCALE_ID } from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';

registerLocaleData(localeEs);

@Component({
  selector: 'app-progreso-paciente',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './progreso-paciente.html',
  styleUrls: ['./progreso-paciente.css'],
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: 'es' },
    provideNativeDateAdapter()
  ]
})
export class ProgresoPaciente {

  // --- 1. LÓGICA DE FECHA (con el Datepicker) ---
  public selectedDate: Date = new Date(); // Fecha actual

  // --- 2. DATOS DE EJEMPLO (para dona, barras y comidas) ---
  calories = {
    current: 900,
    total: 1200
  };

  macros = [
    { name: 'Proteina', current: 45, total: 70 },
    { name: 'Carbohidratos', current: 95, total: 180 },
    { name: 'Grasas', current: 46, total: 50 }
  ];

  meals = [
    { name: 'Desayuno', kcal: 200 },
    { name: 'Almuerzo', kcal: 500 },
    { name: 'Snacks', kcal: 25 },
    { name: 'Cena', kcal: 175 }
  ];

  constructor() { }
  onDateChange(event: any): void {
    console.log("Nueva fecha seleccionada:", this.selectedDate);
    //cargar datos
  }

  getCalorieGradient(): string {
    const percentage = (this.calories.current / this.calories.total) * 100;
    const degrees = (percentage / 100) * 360;
    const progressColor = '#28a745';
    const trackColor = '#f0f0f0';
    return `conic-gradient(${progressColor} 0deg ${degrees}deg, ${trackColor} ${degrees}deg 360deg)`;
  }
}
