
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

  listarPorFecha(fecha: string): Observable<any[]> {
    // El backend espera la fecha en formato YYYY-MM-DD en la URL
    return this.http.get<any[]>(`${this.apiUrl}/listarCitasPorPaciente/${fecha}`, { headers: this.getHeaders() });
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
  unirseACita(idCita: number): Observable<string> {
    // IMPORTANTE: responseType: 'text' porque el backend devuelve un String plano (el link)
    return this.http.get(`${this.apiUrl}/unirseACita/${idCita}`, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  /**
   * 5. Filtra citas para HOY
   * (Nota: El backend en CitaController.java usa "/paciente/hoy/{idPaciente}")
   */
  listarMisCitasHoy(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/paciente/hoy`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * 6. Filtra citas para MAÑANA
   * (Nota: El backend en CitaController.java usa "/paciente/mañana/{idPaciente}")
   */
  listarMisCitasManana(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/paciente/manana`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('ListarCitaService error:', error);
    return throwError(() => error);
  }
}
