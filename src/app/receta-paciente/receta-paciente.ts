import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
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
  cantidadPorcion?:number;
  idPlanReceta?: number;
  idPlanRecetaReceta?: number;
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

  selectedFilters: string | null = null;

  recetas: RecetaDisplay[] = [];
  totalRecetas = 0;
  pageSize = 3;
  pageIndex = 0;

  isSearching = false;

  sugerencias: string[] = [];
  private debounceTimer: any;
  private allRecetas: RecetaDisplay[] = [];

  constructor(
    private recetaService: RecetaPacienteService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.selectedTab = 0;
    this.cargarRecetas();
  }

  // --- LÓGICA DE AUTOCOMPLETADO Y BÚSQUEDA POR TEXTO ---

  autocompletar() {
    clearTimeout(this.debounceTimer);
    const query = this.searchQuery.trim();

    if (query.length < 3) {
      this.sugerencias = [];
      this.cd.detectChanges();
      return;
    }

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

  seleccionarSugerencia(sugerencia: string) {
    this.searchQuery = sugerencia;
    this.sugerencias = [];
    this.buscar();
  }

  buscar() {
    const q = this.searchQuery.trim();
    this.sugerencias = [];


    if (!q) {
      this.isSearching = false;
      this.cargarRecetas();
      return;
    }

    this.isSearching = true;

    this.recetaService.buscarRecetas(q).subscribe({
      next: (data) => {
        this.recetas = this.mapearRecetasBackend(data);
        this.totalRecetas = this.recetas.length;
        this.pageIndex = 0;
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
      }
    });
  }

  // --- CARGA DE DATOS ---

  cargarRecetas() {
    this.isSearching = false;
    this.selectedFilters = null;

    if (this.selectedTab === 0) {
      this.recetaService.listarPlanRecetas().subscribe({
        next: (planes) => {
          this.allRecetas = this.convertirPlanRecetasADisplay(planes);
          this.totalRecetas = this.allRecetas.length;
          this.paginarRecetas();
          this.cd.detectChanges();
        },
        error: (error) => console.error('Error al cargar recetas:', error)
      });
    } else if (this.selectedTab === 1) {
      this.recetaService.listarPlanRecetasFavoritos().subscribe({
        next: (planes) => {
          this.allRecetas = this.convertirPlanRecetasADisplay(planes);
          this.totalRecetas = this.allRecetas.length;
          this.paginarRecetas();
          this.cd.detectChanges();
        },
        error: (error) => console.error('Error al cargar favoritos:', error)
      });
    } else if (this.selectedTab === 2) {
      this.recetaService.listarRecetasAgregadasHoy().subscribe({
        next: (data) => {
          this.recetas = data.map(r => ({
            id: r.recetaId,
            nombre: r.nombre,
            descripcion: r.descripcion,
            seguimientoId: r.seguimientoId,
            recetaId: r.recetaId
          }));
          this.totalRecetas = this.recetas.length;
          this.cd.detectChanges();
        },
        error: (error) => console.error('Error al cargar recetas del día:', error)
      });
    }
  }

  // --- FILTROS POR HORARIO ---

  onFiltroChange(nuevoValor: string | null) {
    this.selectedFilters = nuevoValor;


    if (!nuevoValor) {
      this.cargarRecetas();
      return;
    }

    this.isSearching = false;

    if (this.selectedTab === 0) {
      this.recetaService.listarRecetasPorHorario(nuevoValor).subscribe({
        next: (data) => {
          this.allRecetas = this.mapearRecetasBackend(data);
          this.actualizarVistaPaginada();
        },
        error: (error) => console.error('Error al filtrar plan:', error)
      });

    } else if (this.selectedTab === 1) {

      this.recetaService.listarPlanRecetasFavoritos().subscribe({
        next: (planes) => {

          const todosLosFavoritos = this.convertirPlanRecetasADisplay(planes);

          this.allRecetas = todosLosFavoritos.filter(r => r.horario === nuevoValor);

          this.actualizarVistaPaginada();
        },
        error: (error) => console.error('Error al filtrar favoritos:', error)
      });
    }
  }

  private actualizarVistaPaginada() {
    this.totalRecetas = this.allRecetas.length;
    this.pageIndex = 0;
    this.paginarRecetas();
    this.cd.detectChanges();
  }


  private mapearRecetasBackend(data: any[]): RecetaDisplay[] {
    return data.map(r => ({
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

    }));
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

  toggleFavorito(receta: RecetaDisplay) {
    if (!receta.idPlanRecetaReceta) {
      console.warn('Falta ID de relación para favorito.');
      alert('Para gestionar favoritos, por favor hazlo desde la pestaña "Para ti" sin filtros activos.');
      return;
    }

    const nuevoEstado = !receta.favorito;
    receta.favorito = nuevoEstado;

    if (this.selectedTab === 1 && !nuevoEstado) {
      this.allRecetas = this.allRecetas.filter(r => r !== receta);
      this.totalRecetas = this.allRecetas.length;
      this.paginarRecetas();
    }

    this.cd.detectChanges();

    this.recetaService.actualizarFavorito(receta.idPlanRecetaReceta, nuevoEstado).subscribe({
      next: () => console.log('Favorito actualizado'),
      error: () => {
        receta.favorito = !nuevoEstado;
        if (this.selectedTab === 1 && !nuevoEstado) this.cargarRecetas();
        this.cd.detectChanges();
        alert('No se pudo guardar el cambio.');
      }
    });
  }

  verReceta(receta: RecetaDisplay) {
    console.log('🔍 Abriendo receta:', receta);
    console.log('🆔 idPlanRecetaReceta disponible:', receta.idPlanRecetaReceta);

    const dialogRef = this.dialog.open(RecetaDetalleDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        id: receta.id,
        nombre: receta.nombre,
        descripcion: receta.descripcion,
        horario: receta.horario,
        tiempo: receta.tiempo,
        calorias: receta.calorias,
        proteinas: receta.proteinas,
        carbohidratos: receta.carbohidratos,
        grasas: receta.grasas,
        ingredientes: receta.ingredientes,
        preparacion: receta.preparacion,
        foto: receta.foto,
        cantidadPorcion: receta.cantidadPorcion,
        idPlanRecetaReceta: receta.idPlanRecetaReceta,
        idPlanReceta: receta.idPlanReceta
      },
      panelClass: 'receta-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        if (this.selectedTab === 2) {
          this.cargarRecetas();
        }
        else {
          console.log('✅ Receta agregada al progreso');
        }
      }
    });
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

  private logRecetaDebug(receta: RecetaDisplay, contexto: string) {
    console.log(`📊 ${contexto}:`, {
      nombre: receta.nombre,
      id: receta.id,
      idPlanReceta: receta.idPlanReceta,
      idPlanRecetaReceta: receta.idPlanRecetaReceta,
      tieneRelacion: !!receta.idPlanRecetaReceta
    });
  }

  eliminarReceta(receta: RecetaDisplay) {
    if (!receta.seguimientoId || !receta.recetaId) return;
    if (!confirm(`¿Eliminar "${receta.nombre}" de tus recetas del día?`)) return;

    this.recetaService.eliminarRecetaDeSeguimiento(receta.seguimientoId, receta.recetaId).subscribe({
      next: () => {
        this.recetas = this.recetas.filter(r =>
          !(r.seguimientoId === receta.seguimientoId && r.recetaId === receta.recetaId)
        );
        this.totalRecetas = this.recetas.length;
        this.cd.detectChanges();
      },
      error: () => alert('Error al eliminar la receta.')
    });
  }

}
