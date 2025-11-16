import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NutricionistaService } from '../../service/nutricionista.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
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
    MatNativeDateModule,
    MatPaginatorModule
  ]
})
export class ListarCitasNutricionista implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  appointments: any[] = [];
  paginatedAppointments: any[] = [];

  selectedAppointment: any = null;
  selectedDate: Date = new Date();

  activeTab: 'hoy' | 'mañana' | 'custom' = 'hoy';

  // paginator
  pageSize = 5;
  pageSizeOptions = [5, 10, 20];
  totalAppointments = 0;
  currentPage = 0;

  constructor(
    private nutricionistaService: NutricionistaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAppointmentsForDate(this.selectedDate);
  }

  onDateChange(date: Date | null): void {
    if (!date) return;

    console.log('Fecha seleccionada:', date);
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

    console.log('Cargando citas para fecha:', selectedStr);

    this.nutricionistaService.listarCitasPorFecha(selectedStr).subscribe({
      next: (data) => {
        console.log('Datos recibidos del backend:', data);

        // ✅ SOLUCIÓN: Verificar si el array está vacío ANTES de procesar
        if (!data || data.length === 0) {
          console.log('No hay citas para esta fecha');
          this.appointments = [];
          this.paginatedAppointments = [];
          this.totalAppointments = 0;
          this.selectedAppointment = null;
          this.currentPage = 0;
          if (this.paginator) {
            this.paginator.pageIndex = 0;
          }
          this.cdr.detectChanges();
          return;
        }

        // ✅ Crear un array de observables para cargar todos los pacientes
        const citasConPaciente$ = data.map((c: any) => {
          const citaBase = {
            id: c.idCita || c.id,
            idPaciente: c.idPaciente,
            patientName: 'Sin paciente',
            avatarInitials: '?',
            time: this.formatTime(c.horaCita || c.hora || ''),
            meetingType: c.tipoCita || c.tipo || 'Virtual',
            description: c.descripcion || 'Sin descripción',
            meetingLink: c.linkReunion || c.link || ''
          };

          // Si no tiene paciente, retornar la cita base
          if (!c.idPaciente) {
            return of(citaBase);
          }

          // ✅ Cargar el paciente y retornar la cita completa
          return this.nutricionistaService.obtenerPacientePorId(c.idPaciente).pipe(
            map((p: any) => {
              const user = p.idusuario;
              if (user) {
                citaBase.patientName = `${user.nombre} ${user.apellido}`;
                citaBase.avatarInitials = this.getInitials(citaBase.patientName);
              } else {
                citaBase.patientName = 'Paciente sin datos';
              }
              return citaBase;
            }),
            catchError(() => {
              citaBase.patientName = 'Paciente no encontrado';
              return of(citaBase);
            })
          );
        });

        // ✅ Esperar a que todas las citas se carguen con sus pacientes
        forkJoin(citasConPaciente$).subscribe({
          next: (citasCompletas) => {
            // ✅ Asignar todas las citas de una vez
            this.appointments = citasCompletas;
            this.totalAppointments = this.appointments.length;

            console.log('Citas procesadas:', this.appointments);

            // Reiniciar paginador
            this.currentPage = 0;
            if (this.paginator) {
              this.paginator.pageIndex = 0;
            }

            this.paginateAppointments({ pageIndex: 0, pageSize: this.pageSize });
            this.selectedAppointment = null;

            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error al cargar pacientes:', err);
            this.appointments = [];
            this.paginatedAppointments = [];
            this.totalAppointments = 0;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar citas:', err);
        this.appointments = [];
        this.paginatedAppointments = [];
        this.totalAppointments = 0;
        this.selectedAppointment = null;
        this.currentPage = 0;
        this.cdr.detectChanges();
      }
    });
  }

  paginateAppointments(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.paginatedAppointments = this.appointments.slice(startIndex, endIndex);
    console.log('Citas paginadas:', this.paginatedAppointments);
  }

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
    if (!time) return 'Sin hora';

    if (time.includes(':')) {
      const parts = time.split(':');
      return `${parts[0]}:${parts[1]}`;
    }

    return time;
  }

  private getInitials(name: string): string {
    if (!name || name === 'Sin nombre') return '?';
    const parts = name.trim().split(' ');
    const firstInitial = parts[0]?.[0] || '';
    const secondInitial = parts[1]?.[0] || '';
    return (firstInitial + secondInitial).toUpperCase();
  }

  selectAppointment(app: any): void {
    this.selectedAppointment = app;
    console.log('Cita seleccionada:', app);
  }

  joinMeeting(event: Event, link: string): void {
    event.stopPropagation();
    if (link) {
      window.open(link, '_blank');
    } else {
      console.warn('No hay link para unirse a esta reunión.');
      alert('Esta cita no tiene un enlace de reunión configurado.');
    }
  }

  cancelAppointment(): void {
    if (!this.selectedAppointment) return;

    const appointmentId = this.selectedAppointment.id;

    if (!confirm(`¿Está seguro de cancelar la cita con ${this.selectedAppointment.patientName}?`)) {
      return;
    }

    this.nutricionistaService.eliminarCita(appointmentId).subscribe({
      next: () => {
        console.log('Cita eliminada correctamente');

        // ✅ Crear un NUEVO array sin la cita eliminada
        this.appointments = [...this.appointments.filter(c => c.id !== appointmentId)];

        // Actualizar contador
        this.totalAppointments = this.appointments.length;

        // ✅ Si la página actual queda vacía, retroceder
        const maxPage = Math.max(0, Math.ceil(this.totalAppointments / this.pageSize) - 1);
        if (this.currentPage > maxPage) {
          this.currentPage = maxPage;
          if (this.paginator) {
            this.paginator.pageIndex = maxPage;
          }
        }

        // Repaginar
        this.paginateAppointments({
          pageIndex: this.currentPage,
          pageSize: this.pageSize
        });

        this.selectedAppointment = null;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al eliminar cita:', err);
        alert('Error al cancelar la cita. Intente nuevamente.');
      }
    });
  }

  trackByAppointmentId(index: number, app: any): any {
    return app.id;
  }
}
