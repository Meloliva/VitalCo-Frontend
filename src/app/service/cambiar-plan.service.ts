import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import { Plan } from '../models/plan.model';
import { Paciente } from '../models/paciente.model';
import {EditarPaciente} from '../models/editar-paciente.model';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CambiarPlanService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}


  // Listar todos los planes de suscripción disponibles (sin autenticación necesaria)
  listarPlanesSuscripcion(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.apiUrl}/listarPlanesSuscripcion`);
  }

  // Obtener datos del paciente actual autenticado
  obtenerPacienteActual(): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.apiUrl}/usuarioPaciente`).pipe(catchError(this.handleError));
  }

  // Cambiar plan del paciente
  cambiarPlanPaciente(dto: EditarPaciente): Observable<Paciente> {
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
