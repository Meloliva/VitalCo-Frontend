import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { SeguimientoDTO } from '../models/seguimiendo-paciente.model';
import { NutricionistaRequerimientoDTO } from '../models/nutricionista-requerimiento';

// Interfaces para gráficas
export interface HistorialSemanalDTO {
  fecha: string;
  caloriasConsumidas: number;
  metaCalorias: number;
}

export interface CumplimientoNutricional {
  consumido?: number;
  requerido?: number;
  porcentaje?: number;
}

export interface VerificarCumplimientoResponse {
  calorias?: CumplimientoNutricional;
  proteinas?: CumplimientoNutricional;
  grasas?: CumplimientoNutricional;
  carbohidratos?: CumplimientoNutricional;
  cumplio?: boolean;
}

export interface SeguimientoResumenDTO {
  nombrePaciente: string;
  totalesNutricionales: {
    calorias: number;
    carbohidratos: number;
    proteinas: number;
    grasas: number;
    requerido_calorias: number;
    requerido_carbohidratos: number;
    requerido_proteinas: number;
    requerido_grasas: number;
  };
  caloriasPorHorario: {
    desayuno: number;
    snack: number;
    almuerzo: number;
    cena: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SeguimientoService {
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

  // ✅ NUEVO: Listar Historial de Planes para el Dropdown
  listarPlanes(dni: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/historialPlanes/${dni}`, { headers: this.getHeaders() });
  }

  // ✅ NUEVO: Obtener Historial Filtrado para la Gráfica
  obtenerHistorialFiltrado(dni: string, fechaInicio?: string, fechaFin?: string, objetivo?: string): Observable<HistorialSemanalDTO[]> {
    let params = new HttpParams().set('dni', dni);

    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    if (objetivo) params = params.set('objetivo', objetivo);

    return this.http.get<HistorialSemanalDTO[]>(
      `${this.apiUrl}/historial`,
      { headers: this.getHeaders(), params }
    );
  }

  // Métodos existentes mantenidos
  obtenerResumenPorDniYFecha(dni: string, fecha: string): Observable<SeguimientoResumenDTO> {
    return this.http.get<SeguimientoResumenDTO>(
      `${this.apiUrl}/resumenSeguimientoNutriPaci/${dni}/${fecha}`,
      { headers: this.getHeaders() }
    );
  }

  obtenerResumenPorFecha(fecha: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/listarSeguimientos/${fecha}`,
      { headers: this.getHeaders() }
    );
  }

  editarPlanAlimenticio(dni: string, dto: NutricionistaRequerimientoDTO) {
    return this.http.put(`${this.apiUrl}/editarNutrientes/${dni}`, dto);
  }

  verificarCumplimientoDiario(dni: string, fecha: string): Observable<VerificarCumplimientoResponse> {
    return this.http.get<VerificarCumplimientoResponse>(
      `${this.apiUrl}/cumplimiento-diario/${dni}/${fecha}`,
      { headers: this.getHeaders() }
    );
  }
}
