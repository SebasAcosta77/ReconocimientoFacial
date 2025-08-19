import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsuarioDetalleDTO } from 'src/DTO/Usuario/usuario-detalle.dto';
import { Rol } from 'src/models/rol/rol';
import { Usuarios } from 'src/models/usuarios/usuarios';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UsuariosService {
  private usuariosRepository: Repository<Usuarios>;

  constructor(private poolConexion: DataSource) {
    this.usuariosRepository = poolConexion.getRepository(Usuarios);
  }

  // Consultar todos los usuarios
  public async consultar(): Promise<Usuarios[]> {
    try {
      const usuarios = await this.usuariosRepository.find();
      return usuarios.length ? usuarios : [];
    } catch (error) {
      throw new HttpException(
        `Fallo al consultar usuarios: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Verificar si existe un usuario
  public async verificarUsuario(codigo: string): Promise<boolean> {
    try {
      const existe = await this.usuariosRepository.findOneBy({
        codUsuario: codigo,
      });
      return !!existe;
    } catch (error) {
      throw new HttpException(
        `Error al verificar usuario ${codigo}: ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  // Registrar un nuevo usuario
  public async registrar(objUsuario: Usuarios): Promise<Usuarios> {
  try {
    if (!objUsuario.codUsuario || objUsuario.codUsuario.trim() === '') {
      throw new HttpException('El codUsuario es requerido', HttpStatus.BAD_REQUEST);
    }

    if (await this.verificarUsuario(objUsuario.codUsuario)) {
      throw new HttpException(
        `El usuario con codUsuario ${objUsuario.codUsuario} ya existe`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // ✅ Cargar el rol por defecto desde la BD y asignarlo
    const rolPorDefecto = await this.poolConexion.getRepository(Rol).findOneBy({ codRol: 1 });
    if (!rolPorDefecto) {
      throw new HttpException('No se encontró el rol por defecto', HttpStatus.BAD_REQUEST);
    }
    objUsuario.rol = rolPorDefecto;

    return await this.usuariosRepository.save(objUsuario);
  } catch (error) {
    throw new HttpException(`Fallo al registrar usuario: ${error.message}`, HttpStatus.BAD_REQUEST);
  }
}

  // Consultar un usuario por codUsuario
  public async consultarUno(codigo: string): Promise<Usuarios[]> {
    try {
      const usuarios = await this.usuariosRepository.findBy({
        codUsuario: codigo,
      });
      return usuarios.length ? usuarios : [];
    } catch (error) {
      throw new HttpException(
        `Fallo al consultar usuario ${codigo}: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Actualizar un usuario
  public async actualizar(objUsuario: Usuarios, codigo: string): Promise<any> {
    try {
      if (!objUsuario.codUsuario || objUsuario.codUsuario.trim() === '') {
        throw new HttpException(
          'El codUsuario es requerido',
          HttpStatus.BAD_REQUEST,
        );
      }

      const resultado = await this.usuariosRepository.update(
        { codUsuario: codigo },
        objUsuario,
      );
      if (resultado.affected === 0) {
        throw new HttpException(
          `No se encontró usuario con codUsuario ${codigo}`,
          HttpStatus.NOT_FOUND,
        );
      }

      return { mensaje: 'Usuario actualizado correctamente', data: objUsuario };
    } catch (error) {
      throw new HttpException(
        `Fallo al actualizar usuario ${codigo}: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Eliminar un usuario
  public async eliminar(codigo: string): Promise<any> {
    try {
      const resultado = await this.usuariosRepository.delete({
        codUsuario: codigo,
      });
      if (resultado.affected === 0) {
        throw new HttpException(
          `No se encontró usuario con codUsuario ${codigo}`,
          HttpStatus.NOT_FOUND,
        );
      }
      return { mensaje: 'Usuario eliminado correctamente' };
    } catch (error) {
      throw new HttpException(
        `Fallo al eliminar usuario ${codigo}: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  public async obtenerDetallesUsuario(
    codUsuario: string,
  ): Promise<UsuarioDetalleDTO> {
    try {
      const usuario = await this.usuariosRepository.findOne({
        where: { codUsuario },
        relations: ['acceso', 'codImagenU'],
      });

      if (!usuario) {
        throw new HttpException(
          `Usuario ${codUsuario} no encontrado`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Usamos la primera foto del array, puedes aplicar lógica para seleccionar la más reciente si quieres
      const primeraFoto = usuario.codImagenU?.[0];

      const rutaBase = 'http://localhost:3550/uploads/imagenes/'; // Ajusta si usas otro dominio o carpeta
      const fotoUrl = primeraFoto
        ? `${rutaBase}${primeraFoto.nombrePrivadoImagen}`
        : null;

      const dto: UsuarioDetalleDTO = {
        codUsuario: usuario.codUsuario,
        nombrsUsuario: usuario.nombrsUsuario,
        apellidosUsuario: usuario.apellidosUsuario,
        fechaNacimientoUsuario: usuario.fechaNacimientoUsuario,
        correoUsuario: usuario.correoUsuario,
        telefonoUsuario: usuario.telefonoUsuario,
        codRol: usuario.codRol,
        nombreAcceso: usuario.acceso?.nombreAcceso,
        claveAcceso: usuario.acceso?.claveAcceso,
        fotoUrl: fotoUrl,
      };

      return dto;
    } catch (error) {
      throw new HttpException(
        `Error al obtener detalles del usuario: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
