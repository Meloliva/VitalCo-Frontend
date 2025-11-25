import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

import { NutricionistaService, RecetaDTO } from '../../service/nutricionista.service';

@Component({
  selector: 'app-listar',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './listar.html',
  styleUrls: ['./listar.css'],
})
export class ListarRecetasNutricionista implements OnInit {

  dataSource = new MatTableDataSource<RecetaDTO>();
  recetasPaginadas: RecetaDTO[] = [];

  // Configuración del paginador
  pageSize = 5;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private nutricionistaService: NutricionistaService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarRecetas();
  }

  cargarRecetas(): void {
    this.nutricionistaService.getRecetas().subscribe({
      next: (data) => {
        console.log("✅ Recetas cargadas:", data);
        this.dataSource.data = data;
        this.actualizarRecetasPaginadas();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("❌ Error al cargar recetas:", err);
      }
    });
  }

  actualizarRecetasPaginadas(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.recetasPaginadas = this.dataSource.data.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.actualizarRecetasPaginadas();
  }

  editar(id: number | undefined): void {
    if (!id) {
      console.warn("⚠️ ID de receta no válido");
      return;
    }
    console.log("✏️ Editando receta:", id);
    this.router.navigate(['/nutricionista/recetas-nutricionista/editar', id]);
  }
}
