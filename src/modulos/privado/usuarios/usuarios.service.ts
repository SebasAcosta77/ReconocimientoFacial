import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
            throw new HttpException(`Fallo al consultar usuarios: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    // Verificar si existe un usuario
    public async verificarUsuario(codigo: string): Promise<boolean> {
        try {
            const existe = await this.usuariosRepository.findOneBy({ codUsuario: codigo });
            return !!existe;
        } catch (error) {
            throw new HttpException(`Error al verificar usuario ${codigo}: ${error.message}`, HttpStatus.CONFLICT);
        }
    }

    // Registrar un nuevo usuario
    public async registrar(objUsuario: Usuarios): Promise<Usuarios> {
        try {
            if (!objUsuario.codUsuario || objUsuario.codUsuario.trim() === '') {
                throw new HttpException('El codUsuario es requerido', HttpStatus.BAD_REQUEST);
            }

            if (await this.verificarUsuario(objUsuario.codUsuario)) {
                throw new HttpException(`El usuario con codUsuario ${objUsuario.codUsuario} ya existe`, HttpStatus.BAD_REQUEST);
            }

            return await this.usuariosRepository.save(objUsuario);
        } catch (error) {
            throw new HttpException(`Fallo al registrar usuario: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    // Consultar un usuario por codUsuario
    public async consultarUno(codigo: string): Promise<Usuarios[]> {
        try {
            const usuarios = await this.usuariosRepository.findBy({ codUsuario: codigo });
            return usuarios.length ? usuarios : [];
        } catch (error) {
            throw new HttpException(`Fallo al consultar usuario ${codigo}: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    // Actualizar un usuario
    public async actualizar(objUsuario: Usuarios, codigo: string): Promise<any> {
        try {
            if (!objUsuario.codUsuario || objUsuario.codUsuario.trim() === '') {
                throw new HttpException('El codUsuario es requerido', HttpStatus.BAD_REQUEST);
            }

            const resultado = await this.usuariosRepository.update({ codUsuario: codigo }, objUsuario);
            if (resultado.affected === 0) {
                throw new HttpException(`No se encontró usuario con codUsuario ${codigo}`, HttpStatus.NOT_FOUND);
            }

            return { mensaje: 'Usuario actualizado correctamente', data: objUsuario };
        } catch (error) {
            throw new HttpException(`Fallo al actualizar usuario ${codigo}: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    // Eliminar un usuario
    public async eliminar(codigo: string): Promise<any> {
        try {
            const resultado = await this.usuariosRepository.delete({ codUsuario: codigo });
            if (resultado.affected === 0) {
                throw new HttpException(`No se encontró usuario con codUsuario ${codigo}`, HttpStatus.NOT_FOUND);
            }
            return { mensaje: 'Usuario eliminado correctamente' };
        } catch (error) {
            throw new HttpException(`Fallo al eliminar usuario ${codigo}: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }
}