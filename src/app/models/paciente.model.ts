import { Usuario } from './usuario.model';
import { Plan } from './plan.model';
import { PlanNutricional } from './plan-nutricional.model';

export interface Paciente {
  id: number;
  idusuario: Usuario;
  altura: number;
  peso: number;
  edad: number;
  idplan: Plan;
  trigliceridos: number;
  actividadFisica: string;
  idPlanNutricional: PlanNutricional;
}
