import { Component, OnInit, LOCALE_ID, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';

registerLocaleData(localeEs);

// Interfaz para la estructura de datos de una cita
interface Appointment {
  id: number;
  patientName: string;
  time: string;
  meetingType: 'Zoom Meeting';
  meetingLink: string;
  description: string;
  avatarInitials: string;
  appointmentDate: Date;
}

@Component({
  selector: 'app-listar-citas',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule
  ],
  templateUrl: './listar-citas.html',
  styleUrls: ['./listar-citas.css'],
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: 'es' },
    provideNativeDateAdapter()
  ]
})
export class ListarCitas implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // --- Propiedades de Paginación ---
  public pageSizeOptions: number[] = [3, 5, 10];
  public pageSize: number = 3;
  public pageIndex: number = 0;
  public totalAppointments: number = 0;

  // --- Propiedades del Componente ---
  public selectedDate: Date = new Date();
  public appointments: Appointment[] = [];
  public paginatedAppointments: Appointment[] = [];
  public selectedAppointment: Appointment | null = null;
  public activeTab: 'hoy' | 'mañana' = 'hoy';

  private allAppointments: Appointment[] = [];

  constructor(public datePipe: DatePipe) {}

  ngOnInit(): void {
    this.createMockAppointments();
    this.loadAppointments(this.selectedDate);
  }

  // 1. Generación de 10 Citas (TODAS ZOOM MEETING)
  createMockAppointments(): void {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    this.allAppointments = [
      { id: 1, patientName: 'Fabiana Catillo', time: '10:00', meetingType: 'Zoom Meeting', meetingLink: 'https://zoom.us/j/1000', description: 'Seguimiento escoger-plan Nutricional', avatarInitials: 'FC', appointmentDate: today },
      { id: 2, patientName: 'Carlos Mendoza', time: '11:30', meetingType: 'Zoom Meeting', meetingLink: 'https://zoom.us/j/1130', description: 'Primera consulta y evaluación', avatarInitials: 'CM', appointmentDate: today },
      { id: 3, patientName: 'Ana Torres', time: '14:00', meetingType: 'Zoom Meeting', meetingLink: 'https://zoom.us/j/1400', description: 'Revisión de resultados', avatarInitials: 'AT', appointmentDate: today },
      { id: 4, patientName: 'Roberto Gómez', time: '15:15', meetingType: 'Zoom Meeting', meetingLink: 'https://zoom.us/j/1515', description: 'Control trimestral de peso', avatarInitials: 'RG', appointmentDate: today },
      { id: 5, patientName: 'Elena Vílchez', time: '16:45', meetingType: 'Zoom Meeting', meetingLink: 'https://zoom.us/j/1645', description: 'Ajuste de dieta deportiva', avatarInitials: 'EV', appointmentDate: today },

      { id: 6, patientName: 'Luis Flores', time: '09:00', meetingType: 'Zoom Meeting', meetingLink: 'https://zoom.us/j/0900', description: 'Introducción al ayuno intermitente', avatarInitials: 'LF', appointmentDate: tomorrow },
      { id: 7, patientName: 'Sara Díaz', time: '10:30', meetingType: 'Zoom Meeting', meetingLink: 'https://zoom.us/j/1030', description: 'Mediciones y escoger-plan inicial', avatarInitials: 'SD', appointmentDate: tomorrow },
      { id: 8, patientName: 'Miguel Ramos', time: '12:00', meetingType: 'Zoom Meeting', meetingLink: 'https://zoom.us/j/1200', description: 'Revisión de diario alimenticio', avatarInitials: 'MR', appointmentDate: tomorrow },
      { id: 9, patientName: 'Claudia Soto', time: '15:00', meetingType: 'Zoom Meeting', meetingLink: 'https://zoom.us/j/1500', description: 'Cita de seguimiento general', avatarInitials: 'CS', appointmentDate: tomorrow },
      { id: 10, patientName: 'Javier Pérez', time: '17:30', meetingType: 'Zoom Meeting', meetingLink: 'https://zoom.us/j/1730', description: 'Optimización de ingesta proteica', avatarInitials: 'JP', appointmentDate: tomorrow }
    ];
  }

  // Actualiza la pestaña activa basándose en la fecha seleccionada
  updateTabStatus(date: Date): void {
    const todayString = this.normalizeDate(new Date());
    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);
    const tomorrowString = this.normalizeDate(tomorrow);
    const selectedDateString = this.normalizeDate(date);

    if (selectedDateString === todayString) {
      this.activeTab = 'hoy';
    } else if (selectedDateString === tomorrowString) {
      this.activeTab = 'mañana';
    } else {
      // Si seleccionó otra fecha, ponemos 'hoy' como pestaña de fallback (o null)
      this.activeTab = 'hoy';
    }
  }

  // 2. Lógica de Filtrado y Carga de Citas
  normalizeDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  loadAppointments(date: Date): void {
    const targetDateString = this.normalizeDate(date);

    // 1. FILTRAR
    this.appointments = this.allAppointments.filter(app => {
      return this.normalizeDate(app.appointmentDate) === targetDateString;
    });

    this.appointments.sort((a, b) => (a.time > b.time) ? 1 : -1);

    // 🚨 Llamada a la función que causaba el error 🚨
    this.updateTabStatus(date); // ¡Ahora existe!

    // 2. ACTUALIZAR PAGINACIÓN
    this.totalAppointments = this.appointments.length;
    this.pageIndex = 0;
    this.paginateAppointments();

    this.selectedAppointment = null;
  }

  // 3. Lógica para la Paginación
  paginateAppointments(event?: PageEvent): void {
    if (event) {
      this.pageSize = event.pageSize;
      this.pageIndex = event.pageIndex;
    }

    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;

    this.paginatedAppointments = this.appointments.slice(start, end);
  }

  // 4. Manejo de Eventos del Datepicker y Pestañas
  onDateChange(event: any): void {
    this.loadAppointments(this.selectedDate);
  }

  changeTab(tab: 'hoy' | 'mañana'): void {
    this.activeTab = tab;
    let newDate = new Date();

    if (tab === 'mañana') {
      newDate.setDate(new Date().getDate() + 1);
    }
    this.selectedDate = newDate;
    this.loadAppointments(this.selectedDate);
  }

  // 5. Lógica de Selección y Cancelación
  selectAppointment(appointment: Appointment): void {
    if (this.selectedAppointment?.id === appointment.id) {
      this.selectedAppointment = null;
    } else {
      this.selectedAppointment = appointment;
    }
  }

  joinMeeting(event: Event, link: string): void {
    event.stopPropagation();
    window.open(link, '_blank');
  }

  cancelAppointment(): void {
    if (!this.selectedAppointment) return;

    const patientName = this.selectedAppointment.patientName;
    if (confirm(`¿Estás seguro de que deseas cancelar la cita con ${patientName}?`)) {

      this.allAppointments = this.allAppointments.filter(
        app => app.id !== this.selectedAppointment!.id
      );

      this.loadAppointments(this.selectedDate);
      alert(`Cita con ${patientName} cancelada.`);
    }
  }
}
