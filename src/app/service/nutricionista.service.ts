import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getLocalStorageItem } from '../utils/browser-utils';

/* ================================
   📦 INTERFACES (DTOs)
================================= */

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
  rol?: RolDTO;
  estado?: string;
  fotoPerfil?: string;
}

export interface TurnoDTO {
  id?: number;
  inicioTurno: string;
  finTurno: string;
}

export interface NutricionistaDTO {
  id?: number;
  idusuario: UsuarioDTO;
  asociaciones: string;
  universidad: string;
  idturno: TurnoDTO;
  gradoAcademico: string;
}

export interface EditarNutricionistaDTO {
  id: number;
  asociaciones?: string;
  gradoAcademico?: string;
  universidad?: string;
  idTurno?: number;
  correo?: string;
  contraseña?: string;
  fotoPerfil?: string;
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

/* ================================
   💼 SERVICIO NUTRICIONISTA
================================= */

@Injectable({
  providedIn: 'root',
})
export class NutricionistaService {
  private readonly apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  /** 🔐 Headers seguros con token si existe */
  private getHeaders(): HttpHeaders {
    const token = getLocalStorageItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return new HttpHeaders(headers);
  }

  /* ================================
     🔹 MÉTODOS API
  ================================= */

  /** 🧾 Listar roles (generalmente sin token) */
  listarRoles(): Observable<RolDTO[]> {
    return this.http.get<RolDTO[]>(`${this.apiUrl}/listarRoles`);
  }

  /** 🕒 Listar turnos disponibles */
  listarTurnos(): Observable<TurnoDTO[]> {
    return this.http.get<TurnoDTO[]>(`${this.apiUrl}/listarTurnos`, {
      headers: this.getHeaders(),
    });
  }

  /** 👤 Registrar usuario base */
  registrarUsuario(usuario: UsuarioDTO): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(`${this.apiUrl}/registrarUsuario`, usuario, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  /** 🩺 Registrar nutricionista */
  registrarNutricionista(nutricionista: NutricionistaDTO): Observable<NutricionistaDTO> {
    return this.http.post<NutricionistaDTO>(
      `${this.apiUrl}/registrarNutricionista`,
      nutricionista,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  /** 📋 Obtener perfil del nutricionista autenticado */
  obtenerDatosNutricionista(): Observable<NutricionistaDTO> {
    return this.http.get<NutricionistaDTO>(`${this.apiUrl}/usuarioNutricionista`, {
      headers: this.getHeaders(),
    });
  }

  /** ✏️ Editar perfil del nutricionista autenticado */
  editarNutricionista(datos: EditarNutricionistaDTO): Observable<NutricionistaDTO> {
    return this.http.put<NutricionistaDTO>(`${this.apiUrl}/editarNutricionista`, datos, {
      headers: this.getHeaders(),
    });
  }

  /** ❌ Eliminar cuenta de usuario nutricionista */
  eliminarUsuario(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/eliminarUsuario`, {
      headers: this.getHeaders(),
    });
  }
  login(credenciales: { correo: string; contraseña: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciales, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

}
