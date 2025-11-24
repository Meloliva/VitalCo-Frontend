import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ListarCitaService } from '../../service/listar-cita.service';
import { ProgramarCitaService } from '../../service/programar-cita.service';
import { CitaDTO } from '../../service/nutricionista.service';

// --- Imports de Material y Angular ---
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
// IMPORTANTE: Este es el arreglo para el error del DateAdapter
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
  styleUrls: ['./listar-citas.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatPaginator,
    DatePipe,
    TitleCasePipe
  ],
  // ESTA LÍNEA ES LA MAGIA QUE SOLUCIONA TU ERROR:
  providers: [provideNativeDateAdapter()]
})
export class ListarCitas implements OnInit {

  citas: CitaDTO[] = [];
  nutricionistas: any[] = [];

  // Variables de Estado
  filtroActivo: 'hoy' | 'manana' | 'calendario' = 'hoy';
  loading: boolean = false;
  selectedDate: Date = new Date();
  activeTab: 'hoy' | 'mañana' = 'hoy';

  // Datos para la vista
  appointments: CitaDTOView[] = [];
  paginatedAppointments: CitaDTOView[] = [];
  selectedAppointment: CitaDTOView | null = null; // La cita que seleccionas con click

  // Paginación
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
    // 1. Primero cargamos nutricionistas para tener los nombres
    this.cargarNutricionistas();
  }

  // --- Lógica de Datos ---

  cargarNutricionistas() {
    this.programarCitaService.listarNutricionistas().subscribe({
      next: (data) => {
        this.nutricionistas = data;
        this.cargarHoy(); // Una vez listos, cargamos las citas
      },
      error: () => this.cargarHoy()
    });
  }

  getNombreNutricionista(id: number): string {
    if (!this.nutricionistas.length) return 'Cargando...';
    const nutri = this.nutricionistas.find(n => n.id === id);
    return (nutri && nutri.idusuario) ? `${nutri.idusuario.nombre} ${nutri.idusuario.apellido}` : 'Nutricionista';
  }

  private initialsFromName(name: string): string {
    if (!name) return 'NP';
    // Toma la primera letra de las dos primeras palabras
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  // --- Cargas de Citas ---

  cargarHoy() {
    this.setLoadingState('hoy');
    this.listarCitaService.listarMisCitasHoy().subscribe(this.processDataObserver());
  }

  cargarManana() {
    this.setLoadingState('mañana', 'manana');
    this.listarCitaService.listarMisCitasManana().subscribe(this.processDataObserver());
  }

  cargarPorFecha(fechaStr: string) {
    this.loading = true;
    this.filtroActivo = 'calendario';
    this.citas = [];
    this.listarCitaService.listarPorFecha(fechaStr).subscribe(this.processDataObserver());
  }

  private setLoadingState(tab: 'hoy' | 'mañana', filtro: any = 'hoy') {
    this.loading = true;
    this.activeTab = tab;
    this.filtroActivo = filtro;
    this.citas = [];
    this.selectedAppointment = null; // Limpiar selección al cambiar pestaña
  }

  private processDataObserver() {
    return {
      next: (data: any[]) => {
        this.citas = data;
        this.buildAppointments();
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (e: any) => {
        console.error(e);
        this.loading = false;
        this.cd.detectChanges();
      }
    };
  }

  // --- Construcción de la Vista (DTOView) ---

  private buildAppointments() {
    this.appointments = this.citas.map(c => {
      const nombre = this.getNombreNutricionista(c.idNutricionista);
      return {
        id: c.id,
        patientName: nombre,
        avatarInitials: this.initialsFromName(nombre),
        date: c.dia, // Asegúrate que tu backend manda 'dia' o 'fecha'
        time: c.hora,
        meetingType: c.link ? 'Reunión Virtual' : 'Presencial',
        meetingLink: c.link,
        description: c.descripcion || 'Sin descripción',
        raw: c
      };
    });
    this.totalAppointments = this.appointments.length;
    this.pageIndex = 0;
    this.updatePagination();
  }

  // --- Eventos de la UI ---

  onDateChange(event: any) {
    const d = event.value; // Viene del Datepicker
    if (!d) return;
    this.selectedDate = d;

    // Convertir a YYYY-MM-DD local
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    this.cargarPorFecha(`${year}-${month}-${day}`);
  }

  changeTab(tab: 'hoy' | 'mañana') {
    if (tab === 'hoy') this.cargarHoy();
    else this.cargarManana();
  }

  // AL HACER CLICK EN UNA TARJETA
  selectAppointment(app: CitaDTOView) {
    this.selectedAppointment = app;
  }

  joinMeeting(event: Event, cita: CitaDTOView) {
    event.stopPropagation(); // Evita que se seleccione la tarjeta al dar click al botón

    // Si la cita no tiene ID o es presencial (sin link), no hacemos nada
    if (!cita.raw?.id) {
      alert('Error: No se puede identificar la cita.');
      return;
    }

    // Opcional: Validación visual rápida antes de llamar al backend
    // Si tuvieras el estado en el DTO, podrías validar aquí si ya pasó o fue cancelada.

    // Llamamos al backend para registrar la asistencia (Cambiar estado a "Aceptada")
    this.listarCitaService.unirseACita(cita.raw.id).subscribe({
      next: (linkBackend) => {
        console.log('Asistencia registrada. Abriendo sala:', linkBackend);

        // Abrir el link que nos devolvió el backend
        if (linkBackend && linkBackend.startsWith('http')) {
          window.open(linkBackend, '_blank');
        } else {
          // Fallback por si el backend devolvió algo raro o vacío, intentamos usar el del frontend si existe
          if (cita.meetingLink) {
            window.open(cita.meetingLink, '_blank');
          } else {
            alert('El enlace de la reunión no es válido.');
          }
        }
      },
      error: (err) => {
        console.error('Error al unirse:', err);
        // Manejo de errores basado en tu backend (ej. "Solo puedes unirte a citas pendientes")
        // Si el backend devuelve el mensaje en el body del error:
        const mensaje = err.error || 'No se pudo unir a la cita. Verifica que esté programada para hoy.';
        alert(mensaje);
      }
    });
  }

  paginateAppointments(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagination();
  }

  private updatePagination() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedAppointments = this.appointments.slice(start, end);
  }

  // --- Botones del Footer ---

  reprogramar() {
    if (this.selectedAppointment?.raw) {
      this.router.navigate(['/sistema/citas/programar'], {
        state: { datosCita: this.selectedAppointment.raw }
      });
    }
  }

  // Valida si estamos en el rango [Inicio - 10min] hasta [Inicio + 5min]
  esHoraDeUnirse(cita: CitaDTOView): boolean {
    if (!cita.date || !cita.time) return false;

    const fechaCita = new Date(`${cita.date}T${cita.time}`);
    const ahora = new Date();

    // Diferencia en minutos
    const diffMs = fechaCita.getTime() - ahora.getTime();
    const minutosRestantes = diffMs / (1000 * 60);

    // Lógica inversa para minutos pasados:
    // minutosRestantes > 0: Faltan X minutos para la cita.
    // minutosRestantes < 0: Han pasado X minutos desde el inicio.

    // Permitir entrar si faltan 10 min o menos (<= 10)
    // Y si no han pasado más de 5 minutos (>= -5)
    return minutosRestantes <= 10 && minutosRestantes >= -5;
  }

  // Texto dinámico para el tooltip o mensaje
  obtenerEstadoBoton(cita: CitaDTOView): string {
    if (!cita.date || !cita.time) return 'Datos inválidos';

    const fechaCita = new Date(`${cita.date}T${cita.time}`);
    const ahora = new Date();
    const diffMs = fechaCita.getTime() - ahora.getTime();
    const minutosRestantes = diffMs / (1000 * 60);

    if (minutosRestantes > 10) return `Habilitado 10 min antes`; // Aún falta mucho
    if (minutosRestantes < -5) return `Tiempo expirado`;         // Ya pasó la tolerancia
    return 'Unirse a la sala';                                   // En rango
  }

  cancelAppointment() {
    if (!this.selectedAppointment?.raw?.id) return;

    if (confirm('¿Seguro que deseas cancelar esta cita?')) {
      this.listarCitaService.eliminarCita(this.selectedAppointment.raw.id).subscribe(() => {
        // Recargar la vista actual
        if (this.filtroActivo === 'hoy') this.cargarHoy();
        else if (this.filtroActivo === 'manana') this.cargarManana();
        else this.buildAppointments();

        this.selectedAppointment = null;
      });
    }
  }
}
