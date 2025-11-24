// Archivo: `src/app/citas/listar-citas/listar-citas.ts`
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ListarCitaService } from '../../service/listar-cita.service';
import { ProgramarCitaService } from '../../service/programar-cita.service';
import { CitaDTO } from '../../service/nutricionista.service';

// --- IMPORTS DE MATERIAL Y ANGULAR ---
import { MatPaginator } from '@angular/material/paginator';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';
// 1. IMPORTAR EL ADAPTADOR DE FECHAS AQUÍ:
import { provideNativeDateAdapter } from '@angular/material/core';

import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';

export interface CitaDTOView {
  id?: number;
  patientName: string;
  avatarInitials: string;
  date: string;
  time: string;
  meetingType: string;
  meetingLink?: string;
  description?: string;
  raw?: CitaDTO;
}

@Component({
  selector: 'app-listar-citas',
  templateUrl: './listar-citas.html',
  standalone: true, // Asegúrate de que sea standalone si usas imports
  imports: [
    MatPaginator,
    MatFormField,
    MatInput,
    MatDatepickerInput,
    FormsModule,
    DatePipe,
    MatDatepicker,
    TitleCasePipe,
    CommonModule
  ],
  styleUrls: ['./listar-citas.css'],
  // 2. AGREGAR ESTO PARA SOLUCIONAR EL ERROR:
  providers: [provideNativeDateAdapter()]
})
export class ListarCitas implements OnInit {

  citas: CitaDTO[] = [];
  nutricionistas: any[] = [];

  filtroActivo: 'hoy' | 'manana' | 'calendario' = 'hoy';
  loading: boolean = false;

  selectedDate: Date = new Date();
  activeTab: 'hoy' | 'mañana' = 'hoy';
  appointments: CitaDTOView[] = [];
  paginatedAppointments: CitaDTOView[] = [];
  selectedAppointment: CitaDTOView | null = null;

  pageSizeOptions = [3, 5, 10];
  pageSize = 3;
  pageIndex = 0;
  totalAppointments = 0;

  constructor(
    private listarCitaService: ListarCitaService,
    private programarCitaService: ProgramarCitaService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarNutricionistas();
  }

  cargarNutricionistas() {
    this.programarCitaService.listarNutricionistas().subscribe({
      next: (data) => {
        this.nutricionistas = data;
        this.cargarHoy();
      },
      error: (e) => {
        console.error('Error cargando nutricionistas', e);
        this.cargarHoy();
      }
    });
  }

  getNombreNutricionista(id: number): string {
    if (!this.nutricionistas.length) return 'Cargando...';
    const nutri = this.nutricionistas.find(n => n.id === id);
    if (nutri && nutri.idusuario) {
      return `${nutri.idusuario.nombre} ${nutri.idusuario.apellido}`;
    }
    return 'Nutricionista no encontrado';
  }

  private initialsFromName(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase();
  }

  cargarHoy() {
    this.loading = true;
    this.filtroActivo = 'hoy';
    this.activeTab = 'hoy';
    this.citas = [];
    this.listarCitaService.listarMisCitasHoy().subscribe({
      next: (data) => {
        this.citas = data;
        this.buildAppointments();
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (e) => {
        console.error(e);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  cargarManana() {
    this.loading = true;
    this.filtroActivo = 'manana';
    this.activeTab = 'mañana';
    this.citas = [];
    this.listarCitaService.listarMisCitasManana().subscribe({
      next: (data) => {
        this.citas = data;
        this.buildAppointments();
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (e) => {
        console.error(e);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  cargarPorFecha(event: any) {
    const fecha = event?.target?.value;
    if (!fecha) return;
    this.loading = true;
    this.filtroActivo = 'calendario';
    this.citas = [];
    this.listarCitaService.listarPorFecha(fecha).subscribe({
      next: (data) => {
        this.citas = data;
        this.buildAppointments();
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (e) => {
        console.error(e);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  private buildAppointments() {
    this.appointments = this.citas.map(c => {
      const nombre = this.getNombreNutricionista(c.idNutricionista) || 'Paciente';
      return {
        id: c.id,
        patientName: nombre,
        avatarInitials: this.initialsFromName(nombre),
        date: c.dia,
        time: c.hora,
        meetingType: c.link ? 'Reunión Virtual' : 'Presencial',
        meetingLink: c.link,
        description: c.descripcion,
        raw: c
      } as CitaDTOView;
    });
    this.totalAppointments = this.appointments.length;
    this.pageIndex = 0;
    this.updatePagination();
  }

  onDateChange(event: any) {
    const d = event?.value || this.selectedDate;
    if (!d) return;

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const fechaStr = `${yyyy}-${mm}-${dd}`;

    this.cargarPorFecha({ target: { value: fechaStr } });
  }

  changeTab(tab: 'hoy' | 'mañana') {
    this.activeTab = tab;
    if (tab === 'hoy') this.cargarHoy();
    else this.cargarManana();
  }

  selectAppointment(app: CitaDTOView) {
    this.selectedAppointment = app;
  }

  joinMeeting(event: Event, link?: string) {
    event.stopPropagation();
    if (link) {
      window.open(link, '_blank');
    }
  }

  cancelAppointment() {
    if (!this.selectedAppointment) return;
    if (!confirm('¿Seguro que deseas cancelar esta cita?')) return;
    const id = this.selectedAppointment.raw?.id;
    if (!id) return;
    this.listarCitaService.eliminarCita(id).subscribe(() => {
      if (this.filtroActivo === 'hoy') this.cargarHoy();
      else if (this.filtroActivo === 'manana') this.cargarManana();
      else {
        const d = this.selectedDate;
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        this.cargarPorFecha({ target: { value: `${yyyy}-${mm}-${dd}` } });
      }
      this.selectedAppointment = null;
    });
  }

  paginateAppointments(event: any) {
    this.pageIndex = event.pageIndex ?? this.pageIndex;
    this.pageSize = event.pageSize ?? this.pageSize;
    this.updatePagination();
  }

  private updatePagination() {
    this.totalAppointments = this.appointments.length;
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedAppointments = this.appointments.slice(start, end);
  }

  reprogramar(citaView: CitaDTOView) {
    const cita = citaView?.raw;
    if (cita) this.router.navigate(['/sistema/citas/programar'], { state: { datosCita: cita } });
  }

  eliminar(citaView: CitaDTOView) {
    const cita = citaView?.raw;
    if (!cita?.id) return;
    if (confirm('¿Seguro que deseas cancelar esta cita?')) {
      this.listarCitaService.eliminarCita(cita.id).subscribe(() => {
        if (this.filtroActivo === 'hoy') this.cargarHoy();
        else if (this.filtroActivo === 'manana') this.cargarManana();
        else this.buildAppointments();
      });
    }
  }
}
