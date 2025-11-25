import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatFormField, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatChipListbox, MatChipOption } from '@angular/material/chips';
import { MatCard } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { RecetaPacienteService, RecetaDelDia } from '../service/receta-paciente.service';
import { Receta } from '../models/receta.model';
import { PlanReceta } from '../models/plan-receta.model';
import { RecetaDetalleDialogComponent } from '../receta-detalle-dialog/receta-detalle-dialog';

interface RecetaDisplay {
  id: number;
  nombre: string;
  descripcion: string;
  favorito?: boolean;
  horario?: string;
  tiempo?: number;
  calorias?: number;
  proteinas?: number;
  carbohidratos?: number;
  grasas?: number;
  ingredientes?: string;
  preparacion?: string;
  foto?: string;
  idPlanReceta?: number;
  idPlanRecetaReceta?: number;

}

@Component({
  selector: 'app-receta-paciente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabGroup,
    MatTab,
    MatFormField,
    MatPrefix,
    MatIcon,
    MatChipListbox,
    MatPaginator,
    MatChipOption,
    MatCard,
    MatButton,
    MatInput
  ],
  templateUrl: './receta-paciente.html',
  styleUrls: ['./receta-paciente.css']
})
export class RecetaPaciente implements OnInit {
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  searchQuery = '';
  selectedTab = 0;
  selectedFilters: string[] = [];
  recetas: RecetaDisplay[] = [];
  totalRecetas = 0;
  pageSize = 3;
  pageIndex = 0;
  isSearching = false;

  private allRecetas: RecetaDisplay[] = [];

  constructor(
    private recetaService: RecetaPacienteService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.cargarRecetas();
  }

  cargarRecetas() {
    this.isSearching = false;
    this.selectedFilters = [];

    if (this.selectedTab === 0) {
      this.recetaService.listarPlanRecetas().subscribe({
        next: (planes) => {
          console.log('Planes recibidos:', planes);
          this.allRecetas = this.convertirPlanRecetasADisplay(planes);
          this.totalRecetas = this.allRecetas.length;
          this.paginarRecetas();
        },
        error: (error) => console.error('Error al cargar recetas:', error)
      });
    } else if (this.selectedTab === 1) {
      this.recetaService.listarPlanRecetasFavoritos().subscribe({
        next: (planes) => {
          console.log('Favoritos recibidos:', planes);
          this.allRecetas = this.convertirPlanRecetasADisplay(planes);
          this.totalRecetas = this.allRecetas.length;
          this.paginarRecetas();
        },
        error: (error) => console.error('Error al cargar favoritos:', error)
      });
    } else if (this.selectedTab === 2) {
      this.recetaService.listarRecetasAgregadasHoy().subscribe({
        next: (data) => {
          console.log('Recetas del día recibidas:', data);
          this.recetas = data.map(r => ({
            id: 0,
            nombre: r.nombre,
            descripcion: r.descripcion
          }));
          this.totalRecetas = this.recetas.length;
        },
        error: (error) => console.error('Error al cargar recetas del día:', error)
      });
    }
  }

  private convertirPlanRecetasADisplay(planes: PlanReceta[]): RecetaDisplay[] {
    const recetasDisplay: RecetaDisplay[] = [];

    planes.forEach(plan => {
      plan.recetas.forEach(relacion => {
        const receta = relacion.recetaDTO;
        recetasDisplay.push({
          id: receta.id,
          idPlanReceta: plan.id,
          idPlanRecetaReceta: relacion.idPlanRecetaReceta, // ✅ Agregar este campo
          nombre: receta.nombre,
          descripcion: receta.descripcion,
          favorito: plan.favorito,
          horario: receta.idhorario?.nombre,
          tiempo: receta.tiempo,
          calorias: receta.calorias,
          proteinas: receta.proteinas,
          carbohidratos: receta.carbohidratos,
          grasas: receta.grasas,
          ingredientes: receta.ingredientes,
          preparacion: receta.preparacion,
          foto: receta.foto
        });
      });
    });

    console.log('Recetas convertidas con idPlanRecetaReceta:', recetasDisplay);
    return recetasDisplay;
  }

  private paginarRecetas() {
    const inicio = this.pageIndex * this.pageSize;
    const fin = inicio + this.pageSize;
    this.recetas = this.allRecetas.slice(inicio, fin);
  }

  buscar() {
    const q = this.searchQuery.trim();
    if (!q) {
      this.isSearching = false;
      this.cargarRecetas();
      return;
    }

    this.isSearching = true;
    this.recetaService.buscarRecetas(q).subscribe({
      next: (data) => {
        this.recetas = data.map(r => ({
          id: r.id,
          nombre: r.nombre,
          descripcion: r.descripcion,
          horario: r.idhorario?.nombre,
          tiempo: r.tiempo,
          calorias: r.calorias,
          proteinas: r.proteinas,
          carbohidratos: r.carbohidratos,
          grasas: r.grasas,
          ingredientes: r.ingredientes,
          preparacion: r.preparacion,
          foto: r.foto
        }));
        this.totalRecetas = this.recetas.length;
        this.pageIndex = 0;

        this.searchQuery = '';
        if (this.searchInput?.nativeElement) {
          this.searchInput.nativeElement.value = '';
          this.searchInput.nativeElement.blur();
        }
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
        this.searchQuery = '';
        if (this.searchInput?.nativeElement) {
          this.searchInput.nativeElement.value = '';
          this.searchInput.nativeElement.blur();
        }
      }
    });
  }

  toggleFavorito(receta: RecetaDisplay) {
    if (!receta.idPlanReceta) {
      console.error('No hay idPlanReceta disponible para:', receta);
      return;
    }

    const nuevoEstado = !receta.favorito;
    console.log(`Actualizando favorito de plan ${receta.idPlanReceta} a ${nuevoEstado}`);

    this.recetaService.actualizarFavorito(receta.idPlanReceta, nuevoEstado).subscribe({
      next: (updated) => {
        console.log('Favorito actualizado:', updated);
        receta.favorito = updated.favorito;

        // Si estamos en favoritos y se desmarca, recargar
        if (this.selectedTab === 1 && !nuevoEstado) {
          setTimeout(() => this.cargarRecetas(), 500);
        }
      },
      error: (error) => {
        console.error('Error al actualizar favorito:', error);
        alert('Error al actualizar favorito. Por favor, intenta nuevamente.');
      }
    });
  }

  verReceta(receta: RecetaDisplay) {
    console.log('Abriendo detalle de receta:', receta);

    const dialogRef = this.dialog.open(RecetaDetalleDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        ...receta,
        idPlanRecetaReceta: this.obtenerIdPlanRecetaReceta(receta) // ✅ Pasar el ID necesario
      },
      panelClass: 'receta-dialog'
    });

    // ✅ Escuchar cuando se cierra el modal
    dialogRef.afterClosed().subscribe(result => {
      // Si result es true, significa que se agregó una receta a progreso
      if (result === true) {
        console.log('Receta agregada a progreso, actualizando vista...');

        // Si estamos en la pestaña "Mis recetas del día", recargar
        if (this.selectedTab === 2) {
          this.cargarRecetas();
        }

        // Mostrar un mensaje opcional
        // this.mostrarMensaje('Receta agregada a tu progreso del día');
      }
    });
  }

// ✅ Método auxiliar para obtener el ID correcto
  private obtenerIdPlanRecetaReceta(receta: RecetaDisplay): number | undefined {
    // Si la receta viene del listado normal, necesitamos buscar su idPlanRecetaReceta
    // Este ID debe venir en la conversión desde el backend

    // Por ahora, si no está disponible directamente, lo dejamos undefined
    // y el botón se deshabilitará

    return (receta as any).idPlanRecetaReceta;
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.paginarRecetas();
  }

  onTabChange(event: any) {
    this.pageIndex = 0;
    this.searchQuery = '';
    this.cargarRecetas();
  }

  onFiltroChange() {
    if (this.selectedFilters.length === 0) {
      this.paginarRecetas();
      return;
    }

    const horarioSeleccionado = this.selectedFilters[0];

    this.recetaService.listarRecetasPorHorario(horarioSeleccionado).subscribe({
      next: (data) => {
        this.allRecetas = data.map(r => ({
          id: r.id,
          nombre: r.nombre,
          descripcion: r.descripcion,
          horario: r.idhorario?.nombre,
          tiempo: r.tiempo,
          calorias: r.calorias,
          proteinas: r.proteinas,
          carbohidratos: r.carbohidratos,
          grasas: r.grasas,
          ingredientes: r.ingredientes,
          preparacion: r.preparacion,
          foto: r.foto
        }));
        this.totalRecetas = this.allRecetas.length;
        this.pageIndex = 0;
        this.paginarRecetas();
      },
      error: (error) => console.error('Error al filtrar:', error)
    });
  }

  eliminarReceta(receta: RecetaDisplay) {
    if (!confirm(`¿Eliminar "${receta.nombre}" de tus recetas del día?`)) return;

    // Eliminación solo visual (sin backend)
    console.log('Eliminando receta de la vista:', receta.nombre);
    this.recetas = this.recetas.filter(r => r.nombre !== receta.nombre);
    this.totalRecetas = this.recetas.length;

    // Nota: Esta eliminación es solo visual. La receta volverá a aparecer
    // si recargas la página, ya que no se elimina del backend
    console.info('⚠️ Nota: Eliminación solo visual. Requiere soporte del backend para persistir.');
  }
}
