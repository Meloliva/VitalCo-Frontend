// src/app/service/programar-cita.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CitaDTO, NutricionistaDTO } from './nutricionista.service'; // Usando tus imports
import { getLocalStorageItem } from '../utils/browser-utils'; // Para obtener el token

@Injectable({
  providedIn: 'root'
})
export class ProgramarCitaService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  /**
   * 🚨 CORRECCIÓN 1:
   * Añadimos el método getHeaders para incluir el token de autenticación
   * en las peticiones que lo requieran.
   */
  private getHeaders(): HttpHeaders {
    const token = getLocalStorageItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return new HttpHeaders(headers);
  }

  /**
   * Registra una nueva cita.
   */
  registrarCita(cita: CitaDTO): Observable<CitaDTO> {
    return this.http.post<CitaDTO>(
      `${this.apiUrl}/registrarCita`,
      cita,
      { headers: this.getHeaders() } // Aplicamos los headers
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene la lista de todos los nutricionistas.
   */
  listarNutricionistas(): Observable<NutricionistaDTO[]> {
    /**
     * 🚨 CORRECCIÓN 2:
     * El endpoint correcto es /listarNutricionistas
     */
    return this.http.get<NutricionistaDTO[]>(
      `${this.apiUrl}/listarNutricionistas`,
      { headers: this.getHeaders() } // Aplicamos los headers
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    /**
     * 🚨 CORRECCIÓN 3:
     * Actualizado el mensaje de error para reflejar el servicio correcto.
     */
    console.error('ProgramarCitaService error:', error);
    return throwError(() => error);
  }
}
