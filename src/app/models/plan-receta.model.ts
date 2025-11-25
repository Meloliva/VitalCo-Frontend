import { Receta } from './receta.model';

export interface PlanRecetaReceta {
  idPlanRecetaReceta: number; // ✅ Este campo debe venir del backend
  idPlanReceta: number;
  recetaDTO: Receta;
}

export interface PlanReceta {
  id: number;
  idPlanalimenticio: number;
  recetas: PlanRecetaReceta[];
  favorito: boolean;
  fecharegistro: string;
}
