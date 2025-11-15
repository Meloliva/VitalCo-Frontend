import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getLocalStorageItem } from '../utils/browser-utils';
import { Paciente } from '../models/paciente.model';

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

export interface RecetaDTO {
  idReceta?: number;
  idhorario: HorarioDTO | null;
  descripcion: string;
  tiempo: number;
  carbohidratos: number;
  calorias: number;
  grasas: number;
  proteinas: number;
  ingredientes: string;
  nombre: string;
  preparacion: string;
  cantidadPorcion: number;
  foto?: null;  // <-- opcional
}

export interface HorarioDTO {
  id: number;
  nombre: string;
}

export interface CitaDTO {
  id?: number;            // viene del backend
  dia: string;            // 'YYYY-MM-DD'
  hora: string;           // 'HH:mm:ss'
  descripcion: string;
  estado?: string;        // opcional porque backend NO lo retorna
  link: string;
  idPaciente: number;
  idNutricionista: number;
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
  listarHorarios(): Observable<HorarioDTO[]> {
    return this.http.get<HorarioDTO[]>(`${this.apiUrl}/listarHorarios`, {
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

  obtenerNutricionistaPorUsuario(idUsuario: number): Observable<NutricionistaDTO> {
    return this.http.get<NutricionistaDTO>(
      `${this.apiUrl}/nutricionistaPorUsuario/${idUsuario}`,
      { headers: this.getHeaders() }
    );
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

  registrarReceta(receta: RecetaDTO): Observable<RecetaDTO> {
    return this.http.post<RecetaDTO>(`${this.apiUrl}/registrarReceta`, receta);
  }

  getRecetas(): Observable<RecetaDTO[]> {
    return this.http.get<RecetaDTO[]>(`${this.apiUrl}/listarRecetas`, {
      headers: this.getHeaders(),
    });
  }

  actualizarReceta(receta: RecetaDTO): Observable<RecetaDTO> {
    return this.http.put<RecetaDTO>(`${this.apiUrl}/editarReceta`, receta);
  }

  registrarCita(cita: CitaDTO): Observable<CitaDTO> {
    return this.http.post<CitaDTO>(
      `${this.apiUrl}/registrarCita`,
      cita,
      { headers: this.getHeaders() }
    );
  }

  buscarPacientePorDni(dni: string): Observable<Paciente> {
    return this.http.get<Paciente>(
      `${this.apiUrl}/buscarPorDni/${dni}`,
      { headers: this.getHeaders() }
    );
  }
}
