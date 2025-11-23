import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import {SeguimientoService} from '../service/seguimiento.service';
import {SeguimientoDTO} from '../models/seguimiendo-paciente.model';
import { ChangeDetectorRef } from '@angular/core';

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
export class ProgresoPaciente implements OnInit {

  public selectedDate: Date = new Date();

  calories = { current: 0, total: 1200 };
  macros: any[] = [];
  meals: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private datePipe: DatePipe,
    private seguimientoService: SeguimientoService,
    private cdr: ChangeDetectorRef
  ) {
    this.macros = [
      { name: 'Proteína', current: 0, total: 70 },
      { name: 'Carbohidratos', current: 0, total: 180 },
      { name: 'Grasas', current: 0, total: 50 }
    ];
  }

  ngOnInit(): void {
    this.loadDataForDate(this.selectedDate);
  }

  onDateChange(event: any): void {
    this.loadDataForDate(this.selectedDate);
  }

  private loadDataForDate(date: Date): void {
    const dateKey = this.datePipe.transform(date, 'yyyy-MM-dd')!;
    this.loading = true;
    this.error = null;

    this.seguimientoService.obtenerResumenPorFecha(dateKey).subscribe({
      next: (data: SeguimientoDTO) => {
        this.mapearDatos(data);
        this.loading = false;
        this.cdr.detectChanges(); // 👈 IMPORTANTE
      },
      error: (err) => {
        console.error('Error al cargar resumen:', err);
        this.error = 'No hay datos para esta fecha';
        this.resetearDatos();
        this.loading = false;
        this.cdr.detectChanges(); // 👈 IMPORTANTE
      }
    });
  }


  private mapearDatos(data: SeguimientoDTO): void {
    const totales = data.totalesNutricionales;
    const horarios = data.caloriasPorHorario;

    this.calories = {
      current: totales.calorias,
      total: totales.requerido_calorias
    };

    this.macros = [
      {
        name: 'Proteína',
        current: totales.proteinas,
        total: totales.requerido_proteinas
      },
      {
        name: 'Carbohidratos',
        current: totales.carbohidratos,
        total: totales.requerido_carbohidratos
      },
      {
        name: 'Grasas',
        current: totales.grasas,
        total: totales.requerido_grasas
      }
    ];

    this.meals = [
      { name: 'Desayuno', kcal: horarios.desayuno },
      { name: 'Almuerzo', kcal: horarios.almuerzo },
      { name: 'Snacks', kcal: horarios.snack },
      { name: 'Cena', kcal: horarios.cena }
    ];
  }

  private resetearDatos(): void {
    this.calories = { current: 0, total: 1200 };
    this.macros = [
      { name: 'Proteína', current: 0, total: 70 },
      { name: 'Carbohidratos', current: 0, total: 180 },
      { name: 'Grasas', current: 0, total: 50 }
    ];
    this.meals = [];
  }

  getCalorieGradient(): string {
    const percentage = (this.calories.current / this.calories.total) * 100;
    const degrees = (percentage / 100) * 360;
    const progressColor = '#fff390';
    const trackColor = '#f0f0f0';
    return `conic-gradient(${progressColor} 0deg ${degrees}deg, ${trackColor} ${degrees}deg 360deg)`;
  }
}
