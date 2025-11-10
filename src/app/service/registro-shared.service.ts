import {BehaviorSubject, Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {UsuarioDTO} from './paciente.service';

export interface DatosRegistroPaciente {
  usuarioId?: number;
  usuarioCompleto?: UsuarioDTO; // ✅ Agregar esta propiedad
  datosSalud?: {
    altura: number;
    peso: number;
    edad: number;
    trigliceridos: number;
  };
  objetivo?: string;
  nivelActividad?: string;
  idPlan?: number;
  idPlanNutricional?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RegistroSharedService {
  private datosRegistro: DatosRegistroPaciente = {};
  private progressSubject = new BehaviorSubject<number>(0);
  public progress$: Observable<number> = this.progressSubject.asObservable();

  private totalPasos = 6;

  constructor() {}

  // ✅ Actualizar método para guardar usuario completo
  guardarUsuarioCompleto(usuario: UsuarioDTO): void {
    this.datosRegistro.usuarioCompleto = usuario;
    this.actualizarProgreso(1);
  }

  guardarDatosSalud(datos: { altura: number; peso: number; edad: number; trigliceridos: number }): void {
    this.datosRegistro.datosSalud = datos;
    this.actualizarProgreso(2);
  }

  guardarNivelActividad(nivel: string): void {
    this.datosRegistro.nivelActividad = nivel;
    this.actualizarProgreso(4);
  }

  guardarPlan(idPlan: number): void {
    this.datosRegistro.idPlan = idPlan;
    this.actualizarProgreso(5);
  }

  guardarPlanNutricional(idPlanNutricional: number): void {
    this.datosRegistro.idPlanNutricional = idPlanNutricional;
    // ✅ NO guardar "objetivo" como campo separado
    this.actualizarProgreso(3); // ✅ Paso 3 de 5
    console.log('✅ Plan nutricional guardado:', idPlanNutricional);
  }

  obtenerDatos(): DatosRegistroPaciente {
    return this.datosRegistro;
  }

  datosCompletos(): boolean {
    const { usuarioCompleto, datosSalud, objetivo, nivelActividad, idPlan, idPlanNutricional } = this.datosRegistro;

    console.log('🔍 Verificando datos completos:', {
      tieneUsuario: !!usuarioCompleto,
      tieneSalud: !!datosSalud,
      tieneActividad: !!nivelActividad,
      tienePlan: !!idPlan,
      tienePlanNutricional: !!idPlanNutricional
    });

    return !!(usuarioCompleto && datosSalud && nivelActividad && idPlan && idPlanNutricional);
  }


  limpiarDatos(): void {
    this.datosRegistro = {};
    this.actualizarProgreso(0);
  }

  private actualizarProgreso(paso: number): void {
    const progreso = (paso / this.totalPasos) * 100;
    this.progressSubject.next(progreso);
  }

  obtenerProgreso(): number {
    return this.progressSubject.value;
  }
}
