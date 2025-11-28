import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core'; // 1. Importamos ChangeDetectorRef
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
import { RecetaPacienteService } from '../service/receta-paciente.service';
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
  // Añadidos para "Mis recetas del día" y autocompletar
  seguimientoId?: number;
  recetaId?: number;
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

  // 🟢 NUEVO: Lista de sugerencias para autocompletar
  sugerencias: string[] = [];
  private debounceTimer: any;

  private allRecetas: RecetaDisplay[] = [];

  constructor(
    private recetaService: RecetaPacienteService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // ✅ 3. Forzamos que inicie siempre en "Para ti" y cargue los datos
    this.selectedTab = 0;
    this.cargarRecetas();
  }

  // 🟢 NUEVO MÉTODO: Maneja la lógica de autocompletar con debounce
  autocompletar() {
    clearTimeout(this.debounceTimer);
    const query = this.searchQuery.trim();

    if (query.length < 3) {
      this.sugerencias = [];
      this.cd.detectChanges();
      return;
    }

    // Retrasar la búsqueda 300ms (debounce)
    this.debounceTimer = setTimeout(() => {
      this.recetaService.autocompletarRecetas(query).subscribe({
        next: (data) => {
          this.sugerencias = data;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error("Error en autocompletar:", err);
          this.sugerencias = [];
          this.cd.detectChanges();
        }
      });
    }, 300);
  }

  // 🟢 NUEVO MÉTODO: Selecciona una sugerencia y realiza la búsqueda
  seleccionarSugerencia(sugerencia: string) {
    this.searchQuery = sugerencia;
    this.sugerencias = []; // Ocultar sugerencias
    this.buscar();
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
          this.cd.detectChanges(); // Forzar actualización visual
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
          this.cd.detectChanges(); // Forzar actualización visual
        },
        error: (error) => console.error('Error al cargar favoritos:', error)
      });
    } else if (this.selectedTab === 2) {
      this.recetaService.listarRecetasAgregadasHoy().subscribe({
        next: (data) => {
          console.log('Recetas del día recibidas:', data);
          this.recetas = data.map(r => ({
            id: r.recetaId,
            nombre: r.nombre,
            descripcion: r.descripcion,
            seguimientoId: r.seguimientoId,
            recetaId: r.recetaId
          }));
          this.totalRecetas = this.recetas.length;
          this.cd.detectChanges(); // Forzar actualización visual
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
          idPlanRecetaReceta: relacion.idPlanRecetaReceta,
          nombre: receta.nombre,
          descripcion: receta.descripcion,
          // Asegúrate de que el backend envíe 'favorito' en la relación
          favorito: (relacion as any).favorito || false,
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

    return recetasDisplay;
  }

  private paginarRecetas() {
    const inicio = this.pageIndex * this.pageSize;
    const fin = inicio + this.pageSize;
    this.recetas = this.allRecetas.slice(inicio, fin);
  }

  buscar() {
    const q = this.searchQuery.trim();

    // 🟢 Limpiar sugerencias al buscar
    this.sugerencias = [];

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
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
      }
    });
  }

  toggleFavorito(receta: RecetaDisplay) {
    if (!receta.idPlanRecetaReceta) {
      console.error('No hay idPlanRecetaReceta disponible para:', receta);
      alert('No se puede actualizar: Falta ID de relación.');
      return;
    }

    const nuevoEstado = !receta.favorito;

    // 1. Actualización visual inmediata (Optimista)
    receta.favorito = nuevoEstado;

    // Si estamos en "Favoritos" y quitamos el like, eliminamos visualmente de inmediato
    if (this.selectedTab === 1 && !nuevoEstado) {
      // Filtramos de la lista global y actualizamos la vista paginada
      this.allRecetas = this.allRecetas.filter(r => r !== receta);
      this.totalRecetas = this.allRecetas.length;
      this.paginarRecetas();
    }

    this.cd.detectChanges(); // Forzamos actualización de la vista

    console.log(`Enviando actualización para relación ${receta.idPlanRecetaReceta}: ${nuevoEstado}`);

    // 2. Llamada al Backend
    this.recetaService.actualizarFavorito(receta.idPlanRecetaReceta, nuevoEstado).subscribe({
      next: (updated) => {
        // Confirmación del servidor (opcional, ya actualizamos visualmente)
        console.log('Backend confirmó actualización:', updated);
      },
      error: (error) => {
        console.error('Error al actualizar favorito:', error);

        // ❌ Si falla, revertimos los cambios (Rollback)
        receta.favorito = !nuevoEstado;

        // Si lo habíamos borrado de favoritos, tendríamos que volver a cargarlo o recargar todo
        if (this.selectedTab === 1 && !nuevoEstado) {
          this.cargarRecetas(); // Recarga completa para restaurar orden
        }

        this.cd.detectChanges();
        alert('No se pudo guardar el cambio. Verifique su conexión.');
      }
    });
  }

  verReceta(receta: RecetaDisplay) {
    const dialogRef = this.dialog.open(RecetaDetalleDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        ...receta,
        idPlanRecetaReceta: (receta as any).idPlanRecetaReceta
      },
      panelClass: 'receta-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true && this.selectedTab === 2) {
        this.cargarRecetas();
      }
    });
  }

  private obtenerIdPlanRecetaReceta(receta: RecetaDisplay): number | undefined {
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
      this.cargarRecetas();
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
          foto: r.foto,
          // Nota: al filtrar se pierde el idPlanRecetaReceta si el backend solo devuelve Receta[]
        }));
        this.totalRecetas = this.allRecetas.length;
        this.pageIndex = 0;
        this.paginarRecetas();
        this.cd.detectChanges();
      },
      error: (error) => console.error('Error al filtrar:', error)
    });
  }

  eliminarReceta(receta: RecetaDisplay) {
    if (!receta.seguimientoId || !receta.recetaId) {
      alert('Error: No se pudo identificar la receta para eliminarla del progreso.');
      console.error('Missing IDs for deletion:', receta);
      return;
    }

    if (!confirm(`¿Eliminar "${receta.nombre}" de tus recetas del día?`)) return;

    // Llama al servicio para eliminar el registro de seguimiento en el backend
    this.recetaService.eliminarRecetaDeSeguimiento(receta.seguimientoId, receta.recetaId).subscribe({
      next: () => {
        // Elimina localmente solo si el backend tuvo éxito
        this.recetas = this.recetas.filter(r =>
          !(r.seguimientoId === receta.seguimientoId && r.recetaId === receta.recetaId)
        );
        this.totalRecetas = this.recetas.length;
        this.cd.detectChanges();
        alert(`✅ "${receta.nombre}" eliminada del progreso del día. El progreso se actualizará.`);
      },
      error: (error) => {
        console.error('Error al eliminar receta de seguimiento:', error);
        const msg = error.error?.message || 'Error al eliminar la receta. Intente de nuevo.';
        alert(`❌ ${msg}`);
        // Si falla la eliminación en el backend, el frontend no se actualiza (rollback implícito)
      }
    });
  }
}
