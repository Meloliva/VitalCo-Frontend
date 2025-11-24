import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NutricionistaService } from '../../service/nutricionista.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// --- Módulos de Material (CORREGIDOS) ---
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // Importante para fechas
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator'; // Importante para paginador

import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-listar',
  templateUrl: './listar.html',
  styleUrls: ['./listar.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule, // Solución al error de DateAdapter
    MatPaginatorModule   // Solución al error de Paginator
  ]
})
export class ListarCitasNutricionista implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  appointments: any[] = [];
  paginatedAppointments: any[] = [];
  selectedAppointment: any = null;
  selectedDate: Date = new Date();
  activeTab: 'hoy' | 'mañana' | 'custom' = 'hoy';

  pageSize = 5;
  pageSizeOptions = [5, 10, 20];
  totalAppointments = 0;
  currentPage = 0;

  constructor(
    private nutricionistaService: NutricionistaService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAppointmentsForDate(this.selectedDate);
  }

  onDateChange(date: Date | null): void {
    if (!date) return;
    this.selectedDate = new Date(date);
    this.updateTabStatus(this.selectedDate);
    this.loadAppointmentsForDate(this.selectedDate);
  }

  private updateTabStatus(date: Date): void {
    const today = this.getDateOnly(new Date());
    const tomorrowD = new Date();
    tomorrowD.setDate(tomorrowD.getDate() + 1);
    const tomorrow = this.getDateOnly(tomorrowD);
    const selected = this.getDateOnly(date);

    if (selected.getTime() === today.getTime()) {
      this.activeTab = 'hoy';
    } else if (selected.getTime() === tomorrow.getTime()) {
      this.activeTab = 'mañana';
    } else {
      this.activeTab = 'custom';
    }
  }

  changeTab(tab: 'hoy' | 'mañana'): void {
    this.activeTab = tab;
    if (tab === 'hoy') {
      this.selectedDate = new Date();
    } else {
      const t = new Date();
      t.setDate(t.getDate() + 1);
      this.selectedDate = t;
    }
    this.loadAppointmentsForDate(this.selectedDate);
  }

  private loadAppointmentsForDate(date: Date): void {
    const selectedStr = this.formatDateForBackend(date);
    console.log('Cargando citas para:', selectedStr);

    this.nutricionistaService.listarCitasPorFecha(selectedStr).subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.limpiarLista();
          return;
        }

        const citasConPaciente$ = data.map((c: any) => {
          // Mapeo seguro de datos
          const citaBase = {
            id: c.idCita || c.id,
            idPaciente: c.idPaciente,
            date: c.dia, // Guardamos fecha para validar hora
            patientName: 'Sin paciente',
            avatarInitials: '?',
            time: c.hora,
            timeDisplay: this.formatTime(c.hora || ''),
            meetingType: c.tipoCita || c.tipo || 'Virtual',
            description: c.descripcion || 'Sin descripción',
            meetingLink: c.linkReunion || c.link || ''
          };

          if (!c.idPaciente) return of(citaBase);

          return this.nutricionistaService.obtenerPacientePorId(c.idPaciente).pipe(
            map((p: any) => {
              const user = p.idusuario;
              if (user) {
                citaBase.patientName = `${user.nombre} ${user.apellido}`;
                citaBase.avatarInitials = this.getInitials(citaBase.patientName);
              }
              return citaBase;
            }),
            catchError(() => of(citaBase))
          );
        });

        forkJoin(citasConPaciente$).subscribe({
          next: (citasCompletas) => {
            this.appointments = citasCompletas;
            this.totalAppointments = this.appointments.length;
            this.paginateAppointments({ pageIndex: 0, pageSize: this.pageSize });
            this.cdr.detectChanges();
          },
          error: () => this.limpiarLista()
        });
      },
      error: () => this.limpiarLista()
    });
  }

  private limpiarLista() {
    this.appointments = [];
    this.paginatedAppointments = [];
    this.totalAppointments = 0;
    this.selectedAppointment = null;
    this.cdr.detectChanges();
  }

  // --- LÓGICA DEL BOTÓN ---
  esHoraDeUnirse(app: any): boolean {
    if (!app.date || !app.time) return false;
    const fechaCita = new Date(`${app.date}T${app.time}`);
    const ahora = new Date();
    const diffMs = fechaCita.getTime() - ahora.getTime();
    const minutosRestantes = diffMs / (1000 * 60);
    // Habilitar: 10 min antes hasta 5 min después
    return minutosRestantes <= 10 && minutosRestantes >= -5;
  }

  obtenerTextoBoton(app: any): string {
    if (!app.date || !app.time) return 'Error';
    const fechaCita = new Date(`${app.date}T${app.time}`);
    const ahora = new Date();
    const diffMs = fechaCita.getTime() - ahora.getTime();
    const minutosRestantes = diffMs / (1000 * 60);

    if (minutosRestantes > 10) return 'Espera...';
    if (minutosRestantes < -5) return 'Cerrado';
    return 'Unirse';
  }

  joinMeeting(event: Event, app: any): void {
    event.stopPropagation();
    if (!app.id) { alert('Error: Cita sin ID'); return; }

    // Llamada al servicio
    this.nutricionistaService.unirseACita(app.id).subscribe({
      next: (linkBackend) => {
        if (linkBackend && linkBackend.startsWith('http')) {
          window.open(linkBackend, '_blank');
        } else {
          if (app.meetingLink) window.open(app.meetingLink, '_blank');
          else alert('Enlace no disponible.');
        }
      },
      error: (err) => {
        const mensaje = err.error || 'No se pudo ingresar. Verifica el horario.';
        alert(mensaje);
      }
    });
  }

  paginateAppointments(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedAppointments = this.appointments.slice(startIndex, endIndex);
  }

  selectAppointment(app: any): void {
    this.selectedAppointment = app;
  }

  cancelAppointment(): void {
    if (!this.selectedAppointment) return;
    if (!confirm(`¿Cancelar cita con ${this.selectedAppointment.patientName}?`)) return;

    this.nutricionistaService.eliminarCita(this.selectedAppointment.id).subscribe({
      next: () => {
        this.appointments = this.appointments.filter(c => c.id !== this.selectedAppointment.id);
        this.totalAppointments = this.appointments.length;
        this.paginateAppointments({ pageIndex: 0, pageSize: this.pageSize });
        this.selectedAppointment = null;
        this.cdr.detectChanges();
      },
      error: () => alert('Error al cancelar')
    });
  }

  reprogramar(): void {
    if(this.selectedAppointment) {
      // Ajusta la ruta si es diferente
      this.router.navigate(['/sistema/citas-nutricionista/programar'], {
        state: { datosCita: this.selectedAppointment }
      });
    }
  }

  // Helpers
  private formatDateForBackend(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  private getDateOnly(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  private formatTime(time: string): string {
    if (!time) return '';
    return time.substring(0, 5);
  }
  private getInitials(name: string): string {
    if (!name) return 'NP';
    return name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
  }
  trackByAppointmentId(index: number, app: any): any { return app.id; }
}
