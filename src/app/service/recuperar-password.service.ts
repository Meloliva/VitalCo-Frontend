import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VerificarCodigo } from '../models/verificar-codigo.model';
import { RestablecerCuenta } from '../models/reestablecer-cuenta.model';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecuperarPasswordService {
  private baseUrl = environment.apiURL; // ajustar base según tu backend
  constructor(private http: HttpClient) {}

  // Llama a POST /recuperarCuenta?correo=...
  solicitarRecuperacion(correo: string): Observable<string> {
    const params = new HttpParams().set('correo', correo);
    return this.http.post<any>(`${this.baseUrl}/recuperarCuenta`, null, { params });
  }

  // Llama a POST /verificarCodigoRecuperacion con body { codigo }
  verificarCodigo(dto: VerificarCodigo): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/verificarCodigoRecuperacion`, dto);
  }

  // Llama a POST /restablecerCuenta con body { correo, nuevaContrasena }
  restablecerCuenta(dto: RestablecerCuenta): Observable<any> {
    return this.http.post(`${this.baseUrl}/restablecerCuenta`, dto, { responseType: 'text' });
  }
}
