import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RolDTO {
  id: number;
  tipo: string;
}

export interface UsuarioDTO {
  id?: number;
  dni: string;
  contraseña: string;
  nombre: string;
  apellido: string;
  correo: string;
  genero: string;
  rol: RolDTO;
  estado?: string;
  fotoPerfil?: string;
}

export interface PlanSuscripcionDTO {
  id?: number;
  tipo: string;
  precio: number;
  beneficiosPlan: string;
  terminosCondiciones: string;
}

export interface PlanNutricionalDTO {
  id?: number;
  duracion: string;
  objetivo: string;
}

export interface PacienteDTO {
  id?: number;
  idusuario: UsuarioDTO;
  altura: number;
  peso: number;
  edad: number;
  idplan: PlanSuscripcionDTO;
  trigliceridos: number;
  actividadFisica: string;
  idPlanNutricional: PlanNutricionalDTO;
}

export interface RegistroPacienteRequest {
  usuario: {
    dni: string;
    contraseña: string;
    nombre: string;
    apellido: string;
    correo: string;
    genero: string;
    fotoPerfil?: string;
  };
  paciente: {
    altura: number;
    peso: number;
    edad: number;
    idPlan: number;
    trigliceridos: number;
    actividadFisica: string;
    idPlanNutricional: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Listar roles (para obtener el ID del rol PACIENTE)
  listarRoles(): Observable<RolDTO[]> {
    return this.http.get<RolDTO[]>(`${this.apiUrl}/listarRoles`);
  }

  // Listar planes de suscripción disponibles
  listarPlanesSuscripcion(): Observable<PlanSuscripcionDTO[]> {
    return this.http.get<PlanSuscripcionDTO[]>(`${this.apiUrl}/listarPlanesSuscripcion`);
  }

  // Listar planes nutricionales disponibles
  listarPlanesNutricionales(): Observable<PlanNutricionalDTO[]> {
    return this.http.get<PlanNutricionalDTO[]>(`${this.apiUrl}/listarPlanesNutricionales`);
  }

  // Registrar usuario
  registrarUsuario(usuario: UsuarioDTO): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(`${this.apiUrl}/registrarUsuario`, usuario);
  }

  // Registrar paciente
  registrarPaciente(paciente: {
    idusuario: { id: number | undefined };
    altura: number;
    peso: number;
    edad: number;
    trigliceridos: number;
    actividadFisica: string | undefined;
    objetivo: string | undefined;
    idplan: { id: number | undefined };
    idPlanNutricional: { id: number | undefined }
  }): Observable<PacienteDTO> {
    return this.http.post<PacienteDTO>(`${this.apiUrl}/registrarPaciente`, paciente);
  }
}
