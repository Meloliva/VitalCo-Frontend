import { Rol } from './rol.model';

export interface Usuario {
  id: number;
  dni: string;
  contraseña?: string;
  nombre: string;
  apellido: string;
  correo: string;
  genero: string;
  rol: Rol;
  estado: string;
  fotoPerfil?: string | null;
  /*codigoRecuperacion: string;
  codigoVerificado: boolean;*/

}
