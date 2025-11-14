import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { UserService } from './userlayout-service';

interface AuthResponseDTO {
  jwt: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private userService: UserService) {}

  login(dni: string, contraseña: string): Observable<AuthResponseDTO> {
    const payload = { dni, contraseña };
    return this.http.post<AuthResponseDTO>(`${this.apiUrl}/authenticate`, payload, { observe: 'response' }).pipe(
      map((resp: HttpResponse<AuthResponseDTO>) => {
        const body = resp.body as AuthResponseDTO | null;
        const headerToken = resp.headers.get('Authorization') || undefined;
        let token = headerToken || (body ? body.jwt : undefined);
        const roles = body?.roles || [];

        // ✅ Remover prefijo "Bearer " si existe
        if (token && token.startsWith('Bearer ')) {
          token = token.substring(7);
        }
        if (token) {
          localStorage.setItem('token', token);
          console.log('✅ Token guardado:', token);
          console.log('✅ Token completo:', token.substring(0, 50) + '...');
          console.log('✅ Token guardado (sin Bearer):', token.substring(0, 20) + '...');
        } else {
          console.error('❌ No se recibió token del backend');
        }
        if (roles && roles.length > 0) {
          localStorage.setItem('roles', JSON.stringify(roles));
          const shortRole = roles[0].replace(/^ROLE_/, '');
          localStorage.setItem('userRole', shortRole);
          console.log('✅ Rol guardado:', shortRole);
        }

        return {
          jwt: token || '',
          roles: roles
        } as AuthResponseDTO;
      }),
      tap(() => {
        // poblar perfil tras login (no bloquear la respuesta del login)
        this.userService.fetchPerfilAutenticado().subscribe({
          next: () => console.log('✅ Perfil cargado'),
          error: (err) => console.error('❌ Error al cargar perfil:', err)
        });
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    localStorage.removeItem('userRole');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRoles(): string[] {
    try {
      const r = localStorage.getItem('roles');
      return r ? JSON.parse(r) : [];
    } catch {
      return [];
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
