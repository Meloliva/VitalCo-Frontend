import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Usuario } from '../models/usuario.model';
import { Paciente } from '../models/paciente.model';
import { Nutricionista } from '../models/nutricionista.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api';
  private currentUserSubject = new BehaviorSubject<Usuario | Paciente | Nutricionista | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  initUserFromStorage(): void {
    if (typeof window === 'undefined') return;
    this.loadUserFromStorage();
  }

  getCurrentUser(): Observable<Usuario | Paciente | Nutricionista | null> {
    return this.currentUser$;
  }

  setCurrentUser(user: Usuario | Paciente | Nutricionista | null): void {
    this.currentUserSubject.next(user);
    if (typeof window === 'undefined') return;
    if (user) {
      this.saveUserToStorage(user);
    } else {
      this.clearUser();
    }
  }

  private getHeaders(): HttpHeaders {
    const token = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;
    const headersConfig: any = { 'Content-Type': 'application/json' };
    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }
    return new HttpHeaders(headersConfig);
  }

  private buildUrlWithHash(url: string, hash?: string): string {
    if (!hash) return url;
    return `${url}${url.includes('?') ? '&' : '?'}hash=${encodeURIComponent(hash)}`;
  }

  listarUsuariosPorRol(rol: string, hash?: string): Observable<Usuario[]> {
    const url = this.buildUrlWithHash(`${this.apiUrl}/usuarios?rol=${encodeURIComponent(rol)}`, hash);
    return this.http.get<Usuario[]>(url, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al listar usuarios por rol:', error);
        return throwError(() => error);
      })
    );
  }

  getUserById(id: number, hash?: string): Observable<Usuario> {
    const url = this.buildUrlWithHash(`${this.apiUrl}/usuarios/${id}`, hash);
    return this.http.get<Usuario>(url, { headers: this.getHeaders() }).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        if (typeof window !== 'undefined') this.saveUserToStorage(user);
      }),
      catchError(error => {
        console.error('Error al obtener usuario por id:', error);
        return throwError(() => error);
      })
    );
  }

  getUsuario(): Observable<Usuario> {
    console.log('👤 Llamando a /usuarioNormal');
    return this.http.get<Usuario>(`${this.apiUrl}/usuarioNormal`, {
      headers: this.getHeaders()
    }).pipe(
      tap(user => {
        console.log('✅ Usuario recibido del backend:', user);
        console.log('📋 Rol recibido:', user.rol);
        this.currentUserSubject.next(user);
        if (typeof window !== 'undefined') this.saveUserToStorage(user);
      }),
      catchError(error => {
        console.error('❌ Error al obtener usuario:', error);
        return throwError(() => error);
      })
    );
  }

  getUsuarioPaciente(): Observable<Paciente> {
    console.log('🩺 Llamando a /usuarioPaciente');
    return this.http.get<Paciente>(`${this.apiUrl}/usuarioPaciente`, {
      headers: this.getHeaders()
    }).pipe(
      tap(paciente => {
        console.log('✅ Paciente recibido del backend:', paciente);
        console.log('👤 Datos del usuario:', paciente.idusuario);
        console.log('🎯 Rol:', paciente.idusuario.rol);
        console.log('📋 Plan:', paciente.idplan);

        this.currentUserSubject.next(paciente);
        if (typeof window !== 'undefined') this.saveUserToStorage(paciente);
      }),
      catchError(error => {
        console.error('❌ Error al obtener paciente:', error);
        return throwError(() => error);
      })
    );
  }

  getUsuarioNutricionista(): Observable<Nutricionista> {
    console.log('👨‍⚕️ Llamando a /usuarioNutricionista');
    return this.http.get<Nutricionista>(`${this.apiUrl}/usuarioNutricionista`, {
      headers: this.getHeaders()
    }).pipe(
      tap(nutricionista => {
        console.log('✅ Nutricionista recibido del backend:', nutricionista);
        console.log('👤 Datos del usuario:', nutricionista.idusuario);
        console.log('🎯 Rol:', nutricionista.idusuario.rol);

        this.currentUserSubject.next(nutricionista);
        if (typeof window !== 'undefined') this.saveUserToStorage(nutricionista);
      }),
      catchError(error => {
        console.error('❌ Error al obtener nutricionista:', error);
        return throwError(() => error);
      })
    );
  }

  fetchPerfilAutenticado(): Observable<Usuario | Paciente | Nutricionista> {
    const current = this.currentUserSubject.value;
    console.log('🎯 fetchPerfilAutenticado - Usuario actual:', current);

    let role = '';

    if (current && 'idusuario' in current) {
      role = (current as Paciente | Nutricionista).idusuario.rol.tipo.toUpperCase();
    } else if (current) {
      role = (current as Usuario).rol.tipo.toUpperCase();
    } else if (typeof window !== 'undefined') {
      role = (localStorage.getItem('userRole') || '').toUpperCase();
    }

    console.log('🎯 fetchPerfilAutenticado - Rol detectado:', role);

    if (role === 'PACIENTE') {
      return this.getUsuarioPaciente();
    }

    if (role === 'NUTRICIONISTA') {
      return this.getUsuarioNutricionista();
    }

    return this.getUsuario().pipe(
      catchError(() => this.getUsuarioNutricionista())
    );
  }

  getCurrentUserProfile(identifier?: number | string, hash?: string): Observable<Usuario | Paciente | Nutricionista> {
    if (typeof identifier === 'number') {
      return this.getUserById(identifier, hash);
    }

    if (typeof identifier === 'string') {
      const roleUpper = identifier.toUpperCase();
      if (roleUpper === 'PACIENTE') {
        return this.getUsuarioPaciente();
      }
      if (roleUpper === 'NUTRICIONISTA') {
        return this.getUsuarioNutricionista();
      }
      return this.listarUsuariosPorRol(identifier, hash).pipe(
        map(usuarios => {
          if (!usuarios || usuarios.length === 0) throw new Error('No hay usuarios para el rol solicitado');
          if (typeof window !== 'undefined') {
            const storedId = localStorage.getItem('userId');
            if (storedId) {
              const idNum = parseInt(storedId, 10);
              const found = usuarios.find(u => u.id === idNum);
              if (found) return found;
            }
          }
          return usuarios[0];
        }),
        tap(user => {
          this.currentUserSubject.next(user);
          if (typeof window !== 'undefined') this.saveUserToStorage(user);
        }),
        catchError(error => {
          console.error('Error al obtener usuario por rol:', error);
          return throwError(() => error);
        })
      );
    }

    return this.fetchPerfilAutenticado().pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        if (typeof window !== 'undefined') this.saveUserToStorage(user);
      }),
      catchError(error => {
        console.error('Error al obtener perfil autenticado:', error);
        return throwError(() => error);
      })
    );
  }

  updateAvatar(avatarUrl: string): Observable<Paciente> {
    return this.http.patch<Paciente>(
      `${this.apiUrl}/editarPaciente`,
      { fotoPerfil: avatarUrl },
      { headers: this.getHeaders() }
    ).pipe(
      tap(paciente => {
        this.currentUserSubject.next(paciente);
        if (typeof window !== 'undefined') this.saveUserToStorage(paciente);
      }),
      catchError(error => {
        console.error('Error al actualizar avatar:', error);
        return throwError(() => error);
      })
    );
  }

  isPremium(): boolean {
    const user = this.currentUserSubject.value;
    console.log('🔍 isPremium - Usuario actual:', user);

    if (!user) {
      console.log('❌ isPremium - No hay usuario');
      return false;
    }

    // Verificar si es un Paciente
    if ('idusuario' in user && 'idplan' in user) {
      const paciente = user as Paciente;
      const roleTipo = paciente.idusuario.rol.tipo.toUpperCase();
      console.log('👤 isPremium - Rol:', roleTipo);

      if (roleTipo !== 'PACIENTE') {
        console.log('❌ isPremium - No es paciente');
        return false;
      }

      const planTipo = paciente.idplan.tipo;
      console.log('📋 isPremium - Tipo de plan:', planTipo);
      const esPremium = planTipo === 'Plan premium';
      console.log('✅ isPremium - Es premium:', esPremium);

      return esPremium;
    }

    console.log('❌ isPremium - Usuario no es paciente');
    return false;
  }

  getUserFullName(): string {
    const user = this.currentUserSubject.value;
    if (!user) return 'Nombre de Usuario';

    if ('idusuario' in user) {
      const userWithUsuario = user as Paciente | Nutricionista;
      return `${userWithUsuario.idusuario.nombre} ${userWithUsuario.idusuario.apellido}`;
    }

    const usuario = user as Usuario;
    return `${usuario.nombre} ${usuario.apellido}`;
  }

  getUserAvatar(): string {
    const user = this.currentUserSubject.value;
    if (!user) return '/Images/iconos/iconoSistemas/image 18';

    if ('idusuario' in user) {
      const userWithUsuario = user as Paciente | Nutricionista;
      return userWithUsuario.idusuario.fotoPerfil || '/Images/iconos/iconoSistemas/image 18';
    }

    const usuario = user as Usuario;
    return usuario.fotoPerfil || '/Images/iconos/iconoSistemas/image 18';
  }

  getUserId(): number | null {
    const user = this.currentUserSubject.value;
    if (!user) return null;

    if ('idusuario' in user) {
      const userWithUsuario = user as Paciente | Nutricionista;
      return userWithUsuario.idusuario.id;
    }

    const usuario = user as Usuario;
    return usuario.id;
  }

  private saveUserToStorage(user: Usuario | Paciente | Nutricionista): void {
    if (typeof window === 'undefined' || !user) return;

    let id: number;
    let nombre: string;
    let apellido: string;
    let rol: { id: number; tipo: string };
    let fotoPerfil: string | null | undefined;
    let planTipo = 'Plan free';

    // Type guard para Paciente
    if ('idusuario' in user && 'idplan' in user) {
      const paciente = user as Paciente;
      id = paciente.idusuario.id;
      nombre = paciente.idusuario.nombre;
      apellido = paciente.idusuario.apellido;
      rol = paciente.idusuario.rol;
      fotoPerfil = paciente.idusuario.fotoPerfil;
      planTipo = paciente.idplan.tipo;
    }
    // Type guard para Nutricionista
    else if ('idusuario' in user && 'especialidad' in user) {
      const nutricionista = user as Nutricionista;
      id = nutricionista.idusuario.id;
      nombre = nutricionista.idusuario.nombre;
      apellido = nutricionista.idusuario.apellido;
      rol = nutricionista.idusuario.rol;
      fotoPerfil = nutricionista.idusuario.fotoPerfil;
    }
    // Usuario normal
    else {
      const usuario = user as Usuario;
      id = usuario.id;
      nombre = usuario.nombre;
      apellido = usuario.apellido;
      rol = usuario.rol;
      fotoPerfil = usuario.fotoPerfil;
    }

    console.log('💾 Guardando usuario en localStorage:', {
      id,
      nombre,
      apellido,
      rol: rol.tipo,
      rolId: rol.id,
      plan: planTipo
    });

    localStorage.setItem('userId', id.toString());
    localStorage.setItem('userName', `${nombre} ${apellido}`);
    localStorage.setItem('userRole', rol.tipo);
    localStorage.setItem('userRoleId', rol.id.toString());
    localStorage.setItem('userPlan', planTipo);

    if (fotoPerfil) {
      localStorage.setItem('userAvatar', fotoPerfil);
    }
  }

  private loadUserFromStorage(): void {
    if (typeof window === 'undefined') return;

    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userRoleId = localStorage.getItem('userRoleId');
    const userRole = localStorage.getItem('userRole');
    const userAvatar = localStorage.getItem('userAvatar');
    const userPlan = localStorage.getItem('userPlan');

    console.log('📥 Cargando desde localStorage:', {
      userId,
      userName,
      userRole,
      userRoleId,
      userPlan,
      userAvatar
    });

    if (userId && userName && userRole && userRoleId) {
      const parts = userName.split(' ');
      const nombre = parts[0] || '';
      const apellido = parts.slice(1).join(' ') || '';

      // Crear un Usuario básico desde localStorage
      const usuario: Usuario = {
        id: parseInt(userId),
        dni: '',
        nombre: nombre,
        apellido: apellido,
        correo: '',
        genero: '',
        estado: 'Activo',
        fotoPerfil: userAvatar || null,
        rol: {
          id: parseInt(userRoleId),
          tipo: userRole
        }
      };

      this.currentUserSubject.next(usuario);
      console.log('✅ Usuario cargado desde localStorage:', usuario);
    }
  }

  clearUser(): void {
    this.currentUserSubject.next(null);
    if (typeof window === 'undefined') return;

    console.log('🧹 Limpiando localStorage');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('userPlan');
    localStorage.removeItem('userRoleId');
  }
}
