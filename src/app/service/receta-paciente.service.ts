import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlanReceta } from '../models/plan-receta.model';
import { Receta } from '../models/receta.model';
import { AuthService } from './auth.service';

export interface RecetaDelDia {
  seguimientoId: number;
  recetaId: number;
  nombre: string;
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecetaPacienteService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Listar todas las recetas del plan del paciente
  listarPlanRecetas(): Observable<PlanReceta[]> {
    return this.http.get<PlanReceta[]>(
      `${this.apiUrl}/listarPlanRecetas`,
      { headers: this.getHeaders() }
    );
  }

  // Listar recetas favoritas
  listarPlanRecetasFavoritos(): Observable<PlanReceta[]> {
    return this.http.get<PlanReceta[]>(
      `${this.apiUrl}/listarPlanRecetasFavoritos`,
      { headers: this.getHeaders() }
    );
  }

  // Listar recetas agregadas hoy (progreso)
  listarRecetasAgregadasHoy(): Observable<RecetaDelDia[]> {
    return this.http.get<RecetaDelDia[]>(
      `${this.apiUrl}/listarRecetasAgregadasHoy`,
      { headers: this.getHeaders() }
    );
  }

  // Buscar recetas por texto
  buscarRecetas(texto: string): Observable<Receta[]> {
    return this.http.get<Receta[]>(
      `${this.apiUrl}/buscarRecetas/${encodeURIComponent(texto)}`,
      { headers: this.getHeaders() }
    );
  }

  // Filtrar recetas por horario
  listarRecetasPorHorario(nombreHorario: string): Observable<Receta[]> {
    return this.http.get<Receta[]>(
      `${this.apiUrl}/listarRecetasPorHorarios/${encodeURIComponent(nombreHorario)}`,
      { headers: this.getHeaders() }
    );
  }

  // Actualizar favorito
  actualizarFavorito(idPlanReceta: number, favorito: boolean): Observable<PlanReceta> {
    return this.http.put<PlanReceta>(
      `${this.apiUrl}/actualizarPlanReceta/${idPlanReceta}/favorito?favorito=${favorito}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // Autocompletar búsqueda
  autocompletarRecetas(texto: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.apiUrl}/autocompletarRecetas/${encodeURIComponent(texto)}`,
      { headers: this.getHeaders() }
    );
  }

  eliminarRecetaDeSeguimiento(seguimientoId: number, recetaId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/eliminarSeguimiento/${seguimientoId}/${recetaId}`,
      { headers: this.getHeaders() }
    );
  }
  agregarProgreso(idPlanRecetaReceta: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/agregarProgreso/${idPlanRecetaReceta}`,
      {},
      { headers: this.getHeaders() }
    );
  }
}
