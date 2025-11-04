// src/app/service/nutricionista.service.ts
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

export interface TurnoDTO {
  id?: number;
  inicioTurno: string; // formato: "HH:mm:ss"
  finTurno: string;    // formato: "HH:mm:ss"
}

export interface NutricionistaDTO {
  id?: number;
  idusuario: UsuarioDTO;
  asociaciones: string;
  universidad: string;
  idturno: TurnoDTO;
  gradoAcademico: string;
}

export interface RegistroNutricionistaRequest {
  usuario: {
    dni: string;
    contraseña: string;
    nombre: string;
    apellido: string;
    correo: string;
    genero: string;
    fotoPerfil?: string;
  };
  nutricionista: {
    asociaciones: string;
    universidad: string;
    idTurno: number;
    gradoAcademico: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NutricionistaService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Listar roles (para obtener el ID del rol NUTRICIONISTA)
  listarRoles(): Observable<RolDTO[]> {
    return this.http.get<RolDTO[]>(`${this.apiUrl}/listarRoles`);
  }

  // Listar turnos disponibles
  listarTurnos(): Observable<TurnoDTO[]> {
    return this.http.get<TurnoDTO[]>(`${this.apiUrl}/listarTurnos`);
  }

  // Registrar usuario
  registrarUsuario(usuario: UsuarioDTO): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(`${this.apiUrl}/registrarUsuario`, usuario);
  }

  // Registrar nutricionista
  registrarNutricionista(nutricionista: NutricionistaDTO): Observable<NutricionistaDTO> {
    return this.http.post<NutricionistaDTO>(`${this.apiUrl}/registrarNutricionista`, nutricionista);
  }

  obtenerPerfil(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/perfil`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

}
