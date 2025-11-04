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
    nombre: string;
  };
  paciente?: {
    idPlan?: {
      premium?: boolean;
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

  /** 🔹 Inicializa el usuario desde el storage solo si estamos en navegador */
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
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getCurrentUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}/listarUsuarios`, {
      headers: this.getHeaders()
    }).pipe(
      map(usuarios => {
        if (!usuarios || usuarios.length === 0) {
          throw new Error('No hay usuarios disponibles');
        }
        if (typeof window !== 'undefined') {
          const storedId = localStorage.getItem('userId');
          if (storedId) {
            const idNum = parseInt(storedId, 10);
            const foundById = usuarios.find(u => u.id === idNum);
            if (foundById) return foundById;
          }
          const pacienteUser = usuarios.find(u => u.rol?.nombre?.toUpperCase() === 'PACIENTE');
          if (pacienteUser) return pacienteUser;
        }
        return usuarios[0];
      }),
      tap(user => {
        this.currentUserSubject.next(user);
        if (typeof window !== 'undefined') this.saveUserToStorage(user);
      }),
      catchError(error => {
        console.error('Error al obtener usuario:', error);
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
    if (!user) return false;

    const roleName = user.rol?.nombre?.toUpperCase() || '';

    if (roleName !== 'PACIENTE') {
      return false;
    }
    const plan = user.paciente?.idPlan;
    if (plan?.premium === true) return true;
    const tipo = plan?.tipo;
    if (typeof tipo === 'string' && tipo.toLowerCase().includes('premium')) return true;

    return false;
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
  eliminarCuenta(): Observable<void> {
    const headers = this.getHeaders();
    return this.http.delete<void>(`${this.apiUrl}/eliminarUsuario`, { headers });
  }

  private saveUserToStorage(user: UserProfile): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem('userId', user.id.toString());
    localStorage.setItem('userName', `${user.nombre} ${user.apellido}`);
    localStorage.setItem('userRole', user.rol.nombre);
    const plan = user.paciente?.idPlan;
    const isPremium = plan?.premium === true || (typeof plan?.tipo === 'string' && plan!.tipo!.toLowerCase().includes('premium'));
    localStorage.setItem('userPlan', isPremium ? 'premium' : 'free');

    if (user.fotoPerfil) {
      localStorage.setItem('userAvatar', user.fotoPerfil);
    }
    //else {
    //       localStorage.removeItem('userAvatar');
    //     }
  }

  private loadUserFromStorage(): void {
    if (typeof window === 'undefined') return;

    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    const userAvatar = localStorage.getItem('userAvatar');
    const userPlan = localStorage.getItem('userPlan');

    if (userId && userName && userRole) {
      const [nombre, apellido] = userName.split(' ');
      this.currentUserSubject.next({
        id: parseInt(userId),
        dni: '',
        nombre: nombre || '',
        apellido: apellido || '',
        correo: '',
        genero: '',
        estado: '',
        fotoPerfil: userAvatar || undefined,
        rol: {
          id: 0,
          nombre: userRole
        },
        paciente: {
          idPlan: {
            premium: userPlan === 'premium',
            tipo: userPlan === 'premium' ? 'Plan premium' : 'Plan free'
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
  }
}
