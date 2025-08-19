import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { hashSync } from 'bcryptjs';
import { Acceso } from 'src/models/acceso/acceso';
import GenerarToken from 'src/utilidades/generarToken';
import { DataSource, Repository } from 'typeorm';
import { ACCESO_SQL } from './register_sql';
import { Usuarios } from 'src/models/usuarios/usuarios';

@Injectable()
export class RegistroService {
  private usuarioRepositorio: Repository<Usuarios>;
  private accesoRepositorio: Repository<Acceso>;

  constructor(private poolConexion: DataSource) {
    this.usuarioRepositorio = poolConexion.getRepository(Usuarios);
    this.accesoRepositorio = poolConexion.getRepository(Acceso);
  }

  public async nuevoUsuario(objAcceso: Acceso, objUsuario: Usuarios): Promise<any> {
    try {
      const usuarioExiste = await this.accesoRepositorio.findBy({
        nombreAcceso: objAcceso.nombreAcceso,
      });

      if (usuarioExiste.length === 0) {
        const codigoUsuario = (await this.usuarioRepositorio.save(objUsuario)).codUsuario;

        const claveCifrada = hashSync(objAcceso.claveAcceso);
        objAcceso.codUsuario = codigoUsuario;
        objAcceso.claveAcceso = claveCifrada;

        await this.accesoRepositorio.save(objAcceso);

        const datosSesion = await this.accesoRepositorio.query(
          ACCESO_SQL.DATOS_SESION,
          [codigoUsuario],
        );

        const token = GenerarToken.procesarRespuesta(datosSesion[0]);

        if (token !== '') {
          
          return {
            mensaje: "Usuario registrado correctamente",
            tokenApp: token
          };
        } else {
          throw new HttpException("Fallo al realizar la autenticación", HttpStatus.METHOD_NOT_ALLOWED);
        }
      } else {
        throw new HttpException("El usuario ya existe", HttpStatus.NOT_ACCEPTABLE);
      }
    } catch (miError) {
      throw new HttpException("Fallo al registrar el usuario", HttpStatus.CONFLICT);
    }
  }
}
