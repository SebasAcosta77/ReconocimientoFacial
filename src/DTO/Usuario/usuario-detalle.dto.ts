export class UsuarioDetalleDTO {
  codUsuario: string;
  nombrsUsuario: string;
  apellidosUsuario: string;
  fechaNacimientoUsuario: Date;
  correoUsuario: string;
  telefonoUsuario: string;
  codRol: number;
  nombreAcceso?: string;
  claveAcceso?: string;
  fotoUrl?: string | null;
}
