import { Usuario } from './usuario.model';

export interface Nutricionista {
  id: number;
  idusuario: Usuario;
  especialidad?: string;
  nroColegiatura?: string;
  aniosExperiencia?: number;
  // Agrega los campos que tenga tu backend
}
