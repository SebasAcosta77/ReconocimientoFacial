import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { Usuarios } from 'src/models/usuarios/usuarios';

@Controller('/usuarios')
export class UsuariosController {
    constructor(private readonly usuarioService: UsuariosService) {}

    // Obtener todos los usuarios
    @Get('/all')
    public async obtenerUsuarios() {
        try {
            const usuarios = await this.usuarioService.consultar();
            return { mensaje: 'Usuarios obtenidos correctamente', data: usuarios };
        } catch (error) {
            throw new HttpException(`Error al obtener usuarios: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Registrar un nuevo usuario
    @Post('/add')
    public async registrarUsuarios(@Body() objUsuario: Usuarios) {
        try {
            if (!objUsuario.codUsuario || objUsuario.codUsuario.trim() === '') {
                throw new HttpException('El codUsuario es requerido', HttpStatus.BAD_REQUEST);
            }
            const resultado = await this.usuarioService.registrar(objUsuario);
            return { mensaje: 'Usuario registrado correctamente', data: resultado };
        } catch (error) {
            throw new HttpException(`Error al registrar usuario: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Consultar un usuario por codUsuario
    @Get('/one/:codUsuario')
    public async consultarUnUsuario(@Param('codUsuario') codUsuario: string) {
        if (!codUsuario || codUsuario.trim() === '') {
            throw new HttpException('Código de usuario no válido', HttpStatus.BAD_REQUEST);
        }
        try {
            const usuarios = await this.usuarioService.consultarUno(codUsuario);
            if (!usuarios.length) {
                throw new HttpException(`No se encontró usuario con codUsuario ${codUsuario}`, HttpStatus.NOT_FOUND);
            }
            return { mensaje: 'Usuario obtenido correctamente', data: usuarios };
        } catch (error) {
            throw new HttpException(`Error al consultar usuario ${codUsuario}: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Actualizar un usuario
    @Put('/update/:codUsuario')
    public async actualizarUsuario(@Body() objActualizar: Usuarios, @Param('codUsuario') codUsuario: string) {
        if (!codUsuario || codUsuario.trim() === '') {
            throw new HttpException('Código de usuario no válido', HttpStatus.BAD_REQUEST);
        }
        try {
            const resultado = await this.usuarioService.actualizar(objActualizar, codUsuario);
            return { mensaje: 'Usuario actualizado correctamente', data: resultado };
        } catch (error) {
            throw new HttpException(`Error al actualizar usuario ${codUsuario}: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Eliminar un usuario
    @Delete('/delete/:codUsuario')
    public async eliminarUsuario(@Param('codUsuario') codUsuario: string) {
        if (!codUsuario || codUsuario.trim() === '') {
            throw new HttpException('Código de usuario no válido', HttpStatus.BAD_REQUEST);
        }
        try {
            const resultado = await this.usuarioService.eliminar(codUsuario);
            return { mensaje: 'Usuario eliminado correctamente', data: resultado };
        } catch (error) {
            throw new HttpException(`Error al eliminar usuario ${codUsuario}: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}