import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

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

  // Obtener resumen de seguimiento por DNI y fecha
  obtenerResumenPorDniYFecha(dni: string, fecha: string): Observable<SeguimientoResumenDTO> {
    return this.http.get<SeguimientoResumenDTO>(
      `${this.apiUrl}/resumenSeguimientoNutriPaci/${dni}/${fecha}`,
      { headers: this.getHeaders() }
    );
  }
}
