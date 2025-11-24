// typescript
// Archivo: `src/app/citas/listar-citas/listar-citas.ts`
import { Component, OnInit } from '@angular/core';
import { ListarCitaService } from '../../service/listar-cita.service';
import {CommonModule, DatePipe} from '@angular/common';

@Component({
  selector: 'app-listar-citas',
  templateUrl: './listar-citas.html',
  imports: [
    DatePipe,
    CommonModule
  ],
  styleUrls: ['./listar-citas.css']
})
export class ListarCitas implements OnInit {
  citas: any[] = [];
  paginatedAppointments: any[] = [];
  isLoading = false;
  selectedAppointment: any | null = null;
  selectedDate: Date = new Date();
  tab: 'none' | 'hoy' | 'manana' = 'none'; // por defecto ninguno
  pageSize = 8;
  currentPage = 1;

  constructor(private listarCitaService: ListarCitaService) {}

  ngOnInit(): void {
    // No cargar automáticamente; esperar acción del usuario (tab Hoy/Manana o selección de Fecha)
  }

  private mapCitas(raw: any[]): any[] {
    return raw.map(c => ({
      id: c.id,
      patientName: c.pacienteNombre || c.nombrePaciente || (c.paciente?.nombre ?? 'Paciente'),
      time: c.hora ?? c.fechaHora ?? '',
      meetingLink: c.enlaceReunion ?? c.link ?? '',
      meetingType: c.tipo ?? 'Presencial',
      description: c.descripcion ?? c.notes ?? '',
      avatarInitials: this.getInitials(c.pacienteNombre || c.nombrePaciente || c.paciente?.nombre)
    }));
  }

  private getInitials(name: string | undefined): string {
    if (!name) return 'U';
    return name.split(' ').slice(0,2).map(s => s.charAt(0)).join('').toUpperCase();
  }

  // carga para Hoy / Mañana (muestra spinner)
  loadCitas(showLoading = true): void {
    if (showLoading) this.isLoading = true;
    this.selectedAppointment = null;

    const obs = this.tab === 'hoy'
      ? this.listarCitaService.getCitasHoy()
      : this.tab === 'manana'
        ? this.listarCitaService.getCitasManana()
        : null;

    if (!obs) {
      this.citas = [];
      this.updatePagination();
      this.isLoading = false;
      return;
    }

    obs.subscribe({
      next: res => {
        this.citas = this.mapCitas(res || []);
        this.currentPage = 1;
        this.updatePagination();
        this.isLoading = false;
      },
      error: err => {
        console.error('listar-citas error:', err);
        this.citas = [];
        this.updatePagination();
        this.isLoading = false;
      }
    });
  }

  // búsqueda por fecha: no mostrar spinner grande para que no demore la UX
  loadCitasPorFecha(showLoading = false): void {
    if (showLoading) this.isLoading = true;
    this.selectedAppointment = null;

    this.listarCitaService.listarCitasPorPaciente(this.selectedDate).subscribe({
      next: res => {
        this.citas = this.mapCitas(res || []);
        this.currentPage = 1;
        this.updatePagination();
        if (showLoading) this.isLoading = false;
      },
      error: err => {
        console.error('listar-citas por fecha error:', err);
        this.citas = [];
        this.updatePagination();
        if (showLoading) this.isLoading = false;
      }
    });
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedAppointments = this.citas.slice(start, start + this.pageSize);
  }

  changePage(delta: number): void {
    const maxPage = Math.max(1, Math.ceil(this.citas.length / this.pageSize));
    this.currentPage = Math.min(maxPage, Math.max(1, this.currentPage + delta));
    this.updatePagination();
  }

  selectAppointment(app: any): void {
    this.selectedAppointment = app;
  }

  joinMeeting(event: Event, link: string, app: any): void {
    event.stopPropagation();
    if (link) window.open(link, '_blank');
    if (app?.id) {
      this.listarCitaService.unirseACita(app.id).subscribe({ next: () => {}, error: () => {} });
    }
  }

  onDateChange(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    if (!input.value) return;
    this.selectedDate = new Date(input.value);
    // Ejecutar búsqueda por fecha (sin spinner grande)
    this.loadCitasPorFecha(false);
  }

  setTab(t: 'none'|'hoy'|'manana'): void {
    this.tab = t;
    if (t === 'hoy' || t === 'manana') {
      this.loadCitas(true); // muestra spinner
    } else {
      this.citas = [];
      this.updatePagination();
    }
  }

  protected readonly Math = Math;
}
