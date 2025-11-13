import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

export interface UserProfile {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  correo: string;
  genero: string;
  estado: string;
  fotoPerfil?: string;
  rol: {
    id: number;
    tipo: string; // ← Cambio: era "nombre", ahora es "tipo"
  };
  paciente?: {
    idPlan?: {
      tipo?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api';
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  initUserFromStorage(): void {
    if (typeof window === 'undefined') return;
    this.loadUserFromStorage();
  }

  getCurrentUser(): Observable<UserProfile | null> {
    return this.currentUser$;
  }

  setCurrentUser(user: UserProfile | null): void {
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

  listarUsuariosPorRol(rol: string, hash?: string): Observable<UserProfile[]> {
    const url = this.buildUrlWithHash(`${this.apiUrl}/usuarios?rol=${encodeURIComponent(rol)}`, hash);
    return this.http.get<UserProfile[]>(url, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error al listar usuarios por rol:', error);
        return throwError(() => error);
      })
    );
  }

  getUserById(id: number, hash?: string): Observable<UserProfile> {
    const url = this.buildUrlWithHash(`${this.apiUrl}/usuarios/${id}`, hash);
    return this.http.get<UserProfile>(url, { headers: this.getHeaders() }).pipe(
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

  getUsuario(): Observable<UserProfile> {
    console.log('🏥 Llamando a /usuarioPaciente');
    return this.http.get<UserProfile>(`${this.apiUrl}/usuarioNormal`, {
      headers: this.getHeaders()
    }).pipe(
      tap(user => {
        console.log('✅ Usuario paciente recibido del backend:', user);
        console.log('📋 Rol recibido:', user.rol);
        console.log('📋 Tipo del rol:', user.rol?.tipo);
        console.log('📋 Paciente recibido:', user.paciente);
        console.log('📋 Plan recibido:', user.paciente?.idPlan);
        console.log('📋 Tipo de plan recibido:', user.paciente?.idPlan?.tipo);

        this.currentUserSubject.next(user);
        if (typeof window !== 'undefined') this.saveUserToStorage(user);
      }),
      catchError(error => {
        console.error('❌ Error al obtener usuario paciente:', error);
        return throwError(() => error);
      })
    );
  }
  getUsuarioPaciente(): Observable<UserProfile> {
    return this.http.get<any>(`${this.apiUrl}/usuarioPaciente`, {
      headers: this.getHeaders()
    }).pipe(
      tap((paciente) => {
        console.log('🩺 Usuario paciente recibido del backend:', paciente);
        console.log('🎯 Rol completo:', JSON.stringify(paciente.idusuario?.rol, null, 2));

        // Adaptar estructura del backend (PacienteDTO) al UserProfile esperado
        const userAdaptado: UserProfile = {
          id: paciente.idusuario?.id || paciente.id,
          dni: paciente.idusuario?.dni || '',
          nombre: paciente.idusuario?.nombre || '',
          apellido: paciente.idusuario?.apellido || '',
          correo: paciente.idusuario?.correo || '',
          genero: paciente.idusuario?.genero || '',
          estado: paciente.idusuario?.estado || '',
          fotoPerfil: paciente.idusuario?.fotoPerfil || null,
          rol: {
            id: Number(paciente.idusuario?.rol?.id) || 0,
            tipo: paciente.idusuario?.rol?.tipo || 'PACIENTE'
          },
          paciente: {
            edad: paciente.edad,
            altura: paciente.altura,
            peso: paciente.peso,
            cntTrigliceridos: paciente.trigliceridos,
            actividadFisica: paciente.actividadFisica,
            idPlan: paciente.idplan
              ? {
                tipo: paciente.idplan.tipo,
                premium: paciente.idplan.tipo?.toLowerCase().includes('premium')
              }
              : undefined,
            idPlanNutricional: paciente.idPlanNutricional
          }
        };
        console.log('✅ Rol adaptado con id:', userAdaptado.rol.id);
        console.log('💾 Guardando en localStorage - Rol ID:', userAdaptado.rol.id);

        // Guardar y emitir el usuario adaptado
        this.currentUserSubject.next(userAdaptado);
        if (typeof window !== 'undefined') this.saveUserToStorage(userAdaptado);
      }),
      catchError((error) => {
        console.error('❌ Error al obtener usuario paciente:', error);
        return throwError(() => error);
      })
    );
  }

  getUsuarioNutricionista(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/usuarioNutricionista`, {
      headers: this.getHeaders()
    }).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        if (typeof window !== 'undefined') this.saveUserToStorage(user);
      }),
      catchError(error => {
        console.error('Error al obtener usuario nutricionista:', error);
        return throwError(() => error);
      })
    );
  }

  fetchPerfilAutenticado(): Observable<UserProfile> {
    const current = this.currentUserSubject.value;
    console.log('🎯 fetchPerfilAutenticado - Usuario actual:', current);

    const role = current?.rol?.tipo?.toUpperCase()
      || (typeof window !== 'undefined' ? (localStorage.getItem('userRole') || '').toUpperCase() : '');

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

  getCurrentUserProfile(identifier?: number | string, hash?: string): Observable<UserProfile> {
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

  updateAvatar(avatarUrl: string): Observable<UserProfile> {
    return this.http.patch<UserProfile>(
      `${this.apiUrl}/editarPaciente`,
      { fotoPerfil: avatarUrl },
      { headers: this.getHeaders() }
    ).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        if (typeof window !== 'undefined') this.saveUserToStorage(user);
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

    const roleTipo = user.rol?.tipo?.toUpperCase() || '';
    console.log('👤 isPremium - Rol:', roleTipo);

    if (roleTipo !== 'PACIENTE') {
      console.log('❌ isPremium - No es paciente');
      return false;
    }

    const planTipo = user.paciente?.idPlan?.tipo;
    console.log('📋 isPremium - Tipo de plan:', planTipo);
    console.log('✅ isPremium - Es premium:', planTipo === 'Plan premium');

    return planTipo === 'Plan premium';
  }

  getUserFullName(): string {
    const user = this.currentUserSubject.value;
    return user ? `${user.nombre} ${user.apellido}` : 'Nombre de Usuario';
  }

  getUserAvatar(): string {
    const user = this.currentUserSubject.value;
    return user?.fotoPerfil || '/Images/iconos/iconoSistemas/image 18';
  }

  getUserId(): number | null {
    return this.currentUserSubject.value?.id || null;
  }

  private saveUserToStorage(user: UserProfile): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem('userId', user.id.toString());
    localStorage.setItem('userName', `${user.nombre} ${user.apellido}`);
    localStorage.setItem('userRole', user.rol.tipo);
    localStorage.setItem('userRoleId', user.rol.id.toString());

    const planTipo = user.paciente?.idPlan?.tipo || 'Plan free';
    console.log('💾 Guardando plan en localStorage:', planTipo);
    console.log('💾 Guardando rol en localStorage:', user.rol.tipo);
    console.log('💾 Guardando rol ID en localStorage:', user.rol.id);
    localStorage.setItem('userPlan', planTipo);

    if (user.fotoPerfil) {
      localStorage.setItem('userAvatar', user.fotoPerfil);
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

    console.log('📥 localStorage completo:', {
      userId,
      userName,
      userRole,
      userAvatar,
      userRoleId,
      userPlan
    });

    if (userId && userName && userRole) {
      const parts = userName.split(' ');
      const nombre = parts.shift() || '';
      const apellido = parts.join(' ') || '';

      this.currentUserSubject.next({
        id: parseInt(userId),
        dni: '',
        nombre: nombre,
        apellido: apellido,
        correo: '',
        genero: '',
        estado: '',
        fotoPerfil: userAvatar || undefined,
        rol: {
          id: userRoleId ? parseInt(userRoleId) : 0,
          tipo: userRole
        },
        paciente: {
          idPlan: {
            tipo: userPlan || 'Plan free'
          }
        }
      });
    }
  }

  clearUser(): void {
    this.currentUserSubject.next(null);
    if (typeof window === 'undefined') return;
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('userPlan');
    localStorage.removeItem('userRoleId');
  }
}
