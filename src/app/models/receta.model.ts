import { Horario } from './horario.model';

export interface Receta {
  id: number;
  nombre: string;
  descripcion: string;
  tiempo: number;
  carbohidratos: number;
  calorias: number;
  grasas: number;
  proteinas: number;
  ingredientes: string;
  preparacion: string;
  cantidadPorcion: number;
  idhorario: Horario;
  foto?: string;
}
