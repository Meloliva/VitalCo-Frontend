import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { NutricionistaService, RecetaDTO } from '../../service/nutricionista.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-listar',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './listar.html',
  styleUrls: ['./listar.css'],
})
export class ListarRecetasNutricionista implements OnInit {

  displayedColumns: string[] = ['foto', 'nombre', 'horario', 'tiempo', 'calorias', 'acciones'];
  dataSource = new MatTableDataSource<RecetaDTO>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private nutricionistaService: NutricionistaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.nutricionistaService.getRecetas().subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: (err) => console.error(err)
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  editar(id: number | undefined) {
    if (!id) return;
    this.router.navigate(['/nutricionista/recetas-nutricionista/editar', id]);
  }
}
