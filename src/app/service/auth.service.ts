import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface AuthResponse {
  jwt: string;
  roles: string[];
}

export interface AuthRequest {
  dni: string;
  contraseña: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  // 🔹 Login
  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/authenticate`, credentials)
      .pipe(
        tap(response => {
          if (response.jwt) {
            this.setToken(response.jwt);
            this.setRoles(response.roles);
          }
        })
      );
  }

  // 🔹 Guardar token
  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      this.tokenSubject.next(token);
    }
  }

  // 🔹 Guardar roles
  private setRoles(roles: string[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('roles', JSON.stringify(roles));
    }
  }

  // 🔹 Obtener roles
  getRoles(): string[] {
    if (typeof window !== 'undefined') {
      const roles = localStorage.getItem('roles');
      return roles ? JSON.parse(roles) : [];
    }
    return [];
  }

  // 🔹 Obtener token
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  // 🔹 Verificar autenticación
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // 🔹 Logout
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('roles');
      this.tokenSubject.next(null);
    }
  }

  // 🔹 Headers con token
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }
}
