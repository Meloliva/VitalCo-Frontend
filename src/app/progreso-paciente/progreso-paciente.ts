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

  public selectedDate: Date = new Date();

  // --- 🔹 Datos por fecha (ejemplo de mini “base de datos”) ---
  private dailyData: Record<string, any> = {
    '2025-11-01': {
      calories: { current: 900, total: 1200 },
      macros: [
        { name: 'Proteína', current: 45, total: 70 },
        { name: 'Carbohidratos', current: 95, total: 180 },
        { name: 'Grasas', current: 46, total: 50 }
      ],
      meals: [
        { name: 'Desayuno', kcal: 200 },
        { name: 'Almuerzo', kcal: 500 },
        { name: 'Snacks', kcal: 25 },
        { name: 'Cena', kcal: 175 }
      ]
    },
    '2025-11-02': {
      calories: { current: 1100, total: 1200 },
      macros: [
        { name: 'Proteína', current: 60, total: 70 },
        { name: 'Carbohidratos', current: 150, total: 180 },
        { name: 'Grasas', current: 48, total: 50 }
      ],
      meals: [
        { name: 'Desayuno', kcal: 300 },
        { name: 'Almuerzo', kcal: 600 },
        { name: 'Snacks', kcal: 0 },
        { name: 'Cena', kcal: 200 }
      ]
    },
    '2025-11-03': {
      calories: { current: 500, total: 1200 },
      macros: [
        { name: 'Proteína', current: 25, total: 70 },
        { name: 'Carbohidratos', current: 50, total: 180 },
        { name: 'Grasas', current: 20, total: 50 }
      ],
      meals: [
        { name: 'Desayuno', kcal: 200 },
        { name: 'Almuerzo', kcal: 0 },
        { name: 'Snacks', kcal: 100 },
        { name: 'Cena', kcal: 200 }
      ]
    }
  };

  // --- 🔹 Variables dinámicas que se mostrarán ---
  calories = { current: 0, total: 1200 };
  macros: any[] = [];
  meals: any[] = [];

  constructor(private datePipe: DatePipe) {
    this.loadDataForDate(this.selectedDate);
  }

  // --- 🧠 Cargar datos según la fecha ---
  onDateChange(event: any): void {
    this.loadDataForDate(this.selectedDate);
  }

  private loadDataForDate(date: Date): void {
    const dateKey = this.datePipe.transform(date, 'yyyy-MM-dd')!;
    const data = this.dailyData[dateKey];

    if (data) {
      this.calories = data.calories;
      this.macros = data.macros;
      this.meals = data.meals;
    } else {
      // 🔸 Si no hay datos, se muestran vacíos o por defecto
      this.calories = { current: 0, total: 1200 };
      this.macros = [
        { name: 'Proteína', current: 0, total: 70 },
        { name: 'Carbohidratos', current: 0, total: 180 },
        { name: 'Grasas', current: 0, total: 50 }
      ];
      this.meals = [];
    }

    console.log("📅 Datos cargados para:", dateKey, data || 'sin datos');
  }

  getCalorieGradient(): string {
    const percentage = (this.calories.current / this.calories.total) * 100;
    const degrees = (percentage / 100) * 360;
    const progressColor = '#fff390';
    const trackColor = '#f0f0f0';
    return `conic-gradient(${progressColor} 0deg ${degrees}deg, ${trackColor} ${degrees}deg 360deg)`;
  }
}
