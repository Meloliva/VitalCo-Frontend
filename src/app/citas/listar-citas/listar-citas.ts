import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
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
  filtroActivo: 'hoy' | 'manana' | 'calendario' = 'hoy';
  loading: boolean = false;

  constructor(
    private listarCitaService: ListarCitaService,
    private router: Router,
    private cd: ChangeDetectorRef // IMPORTANTE: Para arreglar el "doble click"
  ) {}

  ngOnInit(): void {
    this.cargarHoy();
  }

  cargarHoy() {
    this.loading = true;
    this.filtroActivo = 'hoy';
    this.citas = []; // Limpiamos la lista visualmente antes de cargar

    this.listarCitaService.listarMisCitasHoy().subscribe({
      next: (data) => {
        console.log('Datos recibidos del backend (HOY):', data); // MIRA LA CONSOLA DEL NAVEGADOR
        this.citas = data;
        this.loading = false;
        this.cd.detectChanges(); // FUERZA LA ACTUALIZACIÓN VISUAL
      },
      error: (e) => {
        console.error('Error:', e);
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
        console.log('Datos recibidos (MAÑANA):', data);
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
        console.log('Datos recibidos (FECHA):', data);
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

  reprogramar(cita: any) {
    this.router.navigate(['/citas/programar-cita'], { state: { datosCita: cita } });
  }

  eliminar(cita: any) {
    if (confirm('¿Seguro que deseas cancelar esta cita?')) {
      this.listarCitaService.eliminarCita(cita.id).subscribe(() => {
        alert('Cita eliminada');
        // Recargar la vista actual
        if (this.filtroActivo === 'hoy') this.cargarHoy();
        else if (this.filtroActivo === 'manana') this.cargarManana();
      });
    }
  }
}
