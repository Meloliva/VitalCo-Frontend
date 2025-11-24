import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ListarCitaService } from '../../service/listar-cita.service';
import { ProgramarCitaService } from '../../service/programar-cita.service'; // Necesario para obtener los nombres
import { NutricionistaDTO } from '../../service/nutricionista.service';
import {CommonModule} from '@angular/common'; // O define la interfaz aquí si prefieres

// Definimos la interfaz tal como la mandaste
export interface CitaDTO {
  id?: number;
  dia: string;
  hora: string;
  descripcion: string;
  link: string;
  idPaciente: number;
  idNutricionista: number;
}

@Component({
  selector: 'app-listar-citas',
  imports: [CommonModule],
  templateUrl: './listar-citas.html',
  styleUrls: ['./listar-citas.css']
})
export class ListarCitas implements OnInit {

  citas: CitaDTO[] = [];
  nutricionistas: any[] = []; // Guardaremos aquí la lista de nutricionistas para consultar los nombres

  filtroActivo: 'hoy' | 'manana' | 'calendario' = 'hoy';
  loading: boolean = false;

  constructor(
    private listarCitaService: ListarCitaService,
    private programarCitaService: ProgramarCitaService, // Inyectamos servicio para leer nutricionistas
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 1. PRIMERO cargamos los datos de los nutricionistas para tener los nombres listos
    this.cargarNutricionistas();
  }

  cargarNutricionistas() {
    this.programarCitaService.listarNutricionistas().subscribe({
      next: (data) => {
        this.nutricionistas = data;
        // 2. UNA VEZ tengamos los nutricionistas, cargamos las citas
        this.cargarHoy();
      },
      error: (e) => {
        console.error('Error cargando nutricionistas', e);
        // Si falla, igual intentamos cargar las citas (saldrán sin nombre)
        this.cargarHoy();
      }
    });
  }

  // --- Función Mágica para obtener el nombre ---
  getNombreNutricionista(id: number): string {
    if (!this.nutricionistas.length) return 'Cargando...';

    // Buscamos en el array el nutricionista con ese ID
    const nutri = this.nutricionistas.find(n => n.id === id);

    if (nutri && nutri.idusuario) {
      return `${nutri.idusuario.nombre} ${nutri.idusuario.apellido}`;
    }
    return 'Nutricionista no encontrado';
  }

  // --- Carga de Citas ---

  cargarHoy() {
    this.loading = true;
    this.filtroActivo = 'hoy';
    this.citas = [];

    this.listarCitaService.listarMisCitasHoy().subscribe({
      next: (data) => {
        this.citas = data;
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
    this.citas = [];

    this.listarCitaService.listarMisCitasManana().subscribe({
      next: (data) => {
        this.citas = data;
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
    const fecha = event.target.value;
    if (!fecha) return;

    this.loading = true;
    this.filtroActivo = 'calendario';
    this.citas = [];

    this.listarCitaService.listarPorFecha(fecha).subscribe({
      next: (data) => {
        this.citas = data;
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

  reprogramar(cita: CitaDTO) {
    this.router.navigate(['/citas/programar-cita'], { state: { datosCita: cita } });
  }

  eliminar(cita: CitaDTO) {
    if (confirm('¿Seguro que deseas cancelar esta cita?')) {
      // Como cita.id es opcional (?), validamos que exista
      if (cita.id) {
        this.listarCitaService.eliminarCita(cita.id).subscribe(() => {
          alert('Cita eliminada');
          if (this.filtroActivo === 'hoy') this.cargarHoy();
          else if (this.filtroActivo === 'manana') this.cargarManana();
        });
      }
    }
  }
}
