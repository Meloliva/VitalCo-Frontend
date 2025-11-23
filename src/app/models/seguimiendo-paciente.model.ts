export interface TotalesNutricionalesDTO {
  calorias: number;
  carbohidratos: number;
  proteinas: number;
  grasas: number;
  requerido_calorias: number;
  requerido_carbohidratos: number;
  requerido_proteinas: number;
  requerido_grasas: number;
}

export interface CaloriasPorHorarioDTO {
  desayuno: number;
  snack: number;
  almuerzo: number;
  cena: number;
}

export interface SeguimientoDTO {
  nombrePaciente: string;
  totalesNutricionales: TotalesNutricionalesDTO;
  caloriasPorHorario: CaloriasPorHorarioDTO;
}
