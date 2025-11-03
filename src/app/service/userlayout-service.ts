import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

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
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api';
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }
  getCurrentUser(): Observable<UserProfile | null> {
    return this.currentUser$;
  }

  setCurrentUser(user: UserProfile | null): void {
    this.currentUserSubject.next(user);
    if (user) {
      this.saveUserToStorage(user);
    } else {
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userAvatar');
    }
  }


  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getCurrentUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}/listarUsuarios`, {
      headers: this.getHeaders()
    }).pipe(
      map(usuarios => usuarios[0]),
      tap(user => {
        this.currentUserSubject.next(user);
        this.saveUserToStorage(user);
      }),
      catchError(error => {
        console.error('Error al obtener usuario:', error);
        return throwError(() => error);
      })
    );
  }

  updateAvatar(avatarUrl: string): Observable<UserProfile> {
    return this.http.patch<UserProfile>(
      `${this.apiUrl}/actualizarFoto`,
      { fotoPerfil: avatarUrl },
      { headers: this.getHeaders() }
    ).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.saveUserToStorage(user);
      }),
      catchError(error => {
        console.error('Error al actualizar avatar:', error);
        return throwError(() => error);
      })
    );
  }

  isPremium(): boolean {
    const user = this.currentUserSubject.value;
    return user?.rol?.nombre === 'PREMIUM' || false;
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
    localStorage.setItem('userId', user.id.toString());
    localStorage.setItem('userName', `${user.nombre} ${user.apellido}`);
    localStorage.setItem('userRole', user.rol.nombre);
    if (user.fotoPerfil) {
      localStorage.setItem('userAvatar', user.fotoPerfil);
    }
  }

  private loadUserFromStorage(): void {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    const userAvatar = localStorage.getItem('userAvatar');

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
        }
      });
    }
  }

  clearUser(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userAvatar');
  }
}
