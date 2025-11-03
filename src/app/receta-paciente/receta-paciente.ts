import { Component, OnInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatChipListbox, MatChipOption } from '@angular/material/chips';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { CommonModule } from '@angular/common';

interface PlanRecetaDTO {
  id: number;
  nombre: string;
  descripcion: string;
  favorito: boolean;
  horario: string;
  tiempo: number;
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
  ingredientes: string;
  preparacion: string;
  foto: string;
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
  searchQuery = '';
  selectedTab = 0;
  selectedFilters: string[] = [];
  recetas: PlanRecetaDTO[] = [];
  totalRecetas = 0;
  pageSize = 3;
  pageIndex = 0;
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarRecetas();
  }

  cargarRecetas() {
    if (this.selectedTab === 0) {
      this.http.get<PlanRecetaDTO[]>(`${this.apiUrl}/listarPlanRecetas`).subscribe({
        next: (data) => {
          this.recetas = data.slice(this.pageIndex * this.pageSize, (this.pageIndex + 1) * this.pageSize);
          this.totalRecetas = data.length;
        },
        error: (error) => console.error('Error al cargar recetas:', error)
      });
    } else if (this.selectedTab === 1) {
      this.http.get<PlanRecetaDTO[]>(`${this.apiUrl}/listarPlanRecetasFavoritos`).subscribe({
        next: (data) => {
          this.recetas = data.slice(this.pageIndex * this.pageSize, (this.pageIndex + 1) * this.pageSize);
          this.totalRecetas = data.length;
        },
        error: (error) => console.error('Error al cargar favoritos:', error)
      });
    } else if (this.selectedTab === 2) {
      this.http.get<any[]>(`${this.apiUrl}/listarRecetasAgregadasHoy`).subscribe({
        next: (data) => {
          this.recetas = data as PlanRecetaDTO[];
          this.totalRecetas = data.length;
        },
        error: (error) => console.error('Error al cargar recetas del día:', error)
      });
    }
  }

  buscar() {
    if (this.searchQuery.trim()) {
      this.http.get<PlanRecetaDTO[]>(`${this.apiUrl}/buscarRecetas/${this.searchQuery}`).subscribe({
        next: (data) => {
          this.recetas = data;
          this.totalRecetas = data.length;
        },
        error: (error) => console.error('Error en búsqueda:', error)
      });
    } else {
      this.cargarRecetas();
    }
  }

  toggleFavorito(receta: PlanRecetaDTO) {
    const nuevoEstado = !receta.favorito;
    this.http.put<PlanRecetaDTO>(`${this.apiUrl}/actualizarPlanReceta/${receta.id}/favorito?favorito=${nuevoEstado}`, {}).subscribe({
      next: (updated) => {
        receta.favorito = updated.favorito;
      },
      error: (error) => console.error('Error al actualizar favorito:', error)
    });
  }

  verReceta(receta: PlanRecetaDTO) {
    console.log('Ver receta:', receta);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarRecetas();
  }

  onTabChange(event: any) {
    this.pageIndex = 0;
    this.cargarRecetas();
  }

  onFiltroChange() {
    if (this.selectedFilters.length > 0) {
      this.http.get<PlanRecetaDTO[]>(`${this.apiUrl}/listarRecetasPorHorarios/${this.selectedFilters[0]}`).subscribe({
        next: (data) => {
          this.recetas = data;
          this.totalRecetas = data.length;
        },
        error: (error) => console.error('Error al filtrar:', error)
      });
    } else {
      this.cargarRecetas();
    }
  }
}
