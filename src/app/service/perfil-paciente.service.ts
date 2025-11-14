import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Paciente } from '../models/paciente.model';
import { Usuario } from '../models/usuario.model';
import { EditarPaciente } from '../models/editar-paciente.model';

@Injectable({
  providedIn: 'root'
})
export class PerfilPacienteService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  /**
   * Llama a DELETE /eliminarUsuario
   * Requiere autorización en backend (NUTRICIONISTA o PACIENTE)
   */
  eliminarUsuario(): Observable<Usuario> {
    const url = `${this.apiUrl}/eliminarUsuario`;
    console.log('🔍 DELETE URL:', url);
    return this.http.delete<Usuario>(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Llama a PUT /editarPaciente
   * Requiere rol PACIENTE
   */
  editarPaciente(dto: EditarPaciente): Observable<Paciente> {
    const url = `${this.apiUrl}/editarPaciente`;
    console.log('🔍 PUT URL:', url);
    console.log('📦 DTO enviado:', dto);
    console.log('🔑 Token:', localStorage.getItem('token'));
    return this.http.put<Paciente>(url, dto).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('PerfilPacienteService error:', error);
    return throwError(() => error);
  }
}
