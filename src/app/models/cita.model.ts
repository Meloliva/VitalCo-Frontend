export interface CitaDTO {
  id?: number;            // viene del backend
  dia: string;            // 'YYYY-MM-DD'
  hora: string;           // 'HH:mm:ss'
  descripcion: string;
  link: string;
  idPaciente: number;
  idNutricionista: number;
}
