
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CitaDTO } from './nutricionista.service'; // Reusamos el CitaDTO
import { getLocalStorageItem } from '../utils/browser-utils';

@Injectable({
  providedIn: 'root'
})
export class ListarCitaService {

  // 🚨 Nota: La URL base de la API debe ser coherente
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = getLocalStorageItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return new HttpHeaders(headers);
  }

  private formatDateToApi(date: Date): string {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10); // YYYY-MM-DD
  }

  listarCitasPorPaciente(fecha: Date | string): Observable<any[]> {
    const fechaStr = fecha instanceof Date ? this.formatDateToApi(fecha) : fecha;
    const url = `${this.apiUrl}/listarCitasPorPaciente/${encodeURIComponent(fechaStr)}`;
    console.debug('[ListarCitaService] GET', url);
    return this.http.get<any[]>(url, { headers: this.getHeaders() })
      .pipe(catchError(error => {
        if (error.status === 404) {
          console.warn('[ListarCitaService] 404. URL/mapping no encontrado o sin datos para fecha:', url, 'statusText:', error.statusText);
        } else {
          console.error('[ListarCitaService] error:', error.status, error.message);
        }
        return throwError(() => error)
      }));
  }

  /**
   * 2. Actualiza una cita (para reprogramar)
   */
  actualizarCita(cita: CitaDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizarCita`, cita, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * 3. Elimina una cita (cancelar)
   */
  eliminarCita(idCita: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminarCita/${idCita}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * 4. Notifica al backend que el paciente se unió
   */
  unirseACita(idCita: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/unirseACita/${idCita}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * 5. Filtra citas para HOY
   * (Nota: El backend en CitaController.java usa "/paciente/hoy/{idPaciente}")
   */
  getCitasHoy(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/paciente/hoy`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * 6. Filtra citas para MAÑANA
   * (Nota: El backend en CitaController.java usa "/paciente/mañana/{idPaciente}")
   */
  getCitasManana(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/paciente/manana`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('ListarCitaService error:', error);
    return throwError(() => error);
  }
}
