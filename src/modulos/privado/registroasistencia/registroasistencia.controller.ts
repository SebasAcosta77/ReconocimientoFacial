import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { RegistroasistenciaService } from './registroasistencia.service';
import { Registroasistencia } from 'src/models/registroasistencia/registroasistencia';

@Controller('/registroasistencia')
export class RegistroasistenciaController {
    constructor(private readonly registroasistenciaservice: RegistroasistenciaService) {}

    // Obtener todos los registros
    @Get('/all')
    public async obtenerRegistroAsistencia() {
        try {
            const registros = await this.registroasistenciaservice.consultar();
            return { mensaje: 'Registros obtenidos correctamente', data: registros };
        } catch (error) {
            throw new HttpException(`Error al obtener registros: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Registrar un nuevo registro de asistencia (para el servicio en Python)
    @Post('/add')
    public async registrarAsistencia(@Body() objAsistencia: Registroasistencia) {
        try {
            if (!objAsistencia.codUsuario || !objAsistencia.codEvento) {
                throw new HttpException('codUsuario y codEvento son requeridos', HttpStatus.BAD_REQUEST);
            }
            const resultado = await this.registroasistenciaservice.registrar(objAsistencia);
            return { mensaje: 'Asistencia registrada correctamente', data: resultado };
        } catch (error) {
            throw new HttpException(`Error al registrar asistencia: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Consultar un registro por codAsistencia
    @Get('/one/:codAsistencia')
    public async consultarUnRegistro(@Param('codAsistencia') codAsistencia: string) {
        const codigo = Number(codAsistencia);
        if (isNaN(codigo)) {
            throw new HttpException('Código de asistencia no válido', HttpStatus.BAD_REQUEST);
        }
        try {
            const registros = await this.registroasistenciaservice.consultarUno(codigo);
            if (!registros.length) {
                throw new HttpException(`No se encontró registro con codAsistencia ${codigo}`, HttpStatus.NOT_FOUND);
            }
            return { mensaje: 'Registro obtenido correctamente', data: registros };
        } catch (error) {
            throw new HttpException(`Error al consultar registro: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Actualizar un registro
    @Put('/update/:codAsistencia')
    public async actualizarRegistro(@Body() objActualizar: Registroasistencia, @Param('codAsistencia') codAsistencia: string) {
        const codigo = Number(codAsistencia);
        if (isNaN(codigo)) {
            throw new HttpException('Código de asistencia no válido', HttpStatus.BAD_REQUEST);
        }
        try {
            const resultado = await this.registroasistenciaservice.actualizar(objActualizar, codigo);
            return { mensaje: 'Registro actualizado correctamente', data: resultado };
        } catch (error) {
            throw new HttpException(`Error al actualizar registro: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Eliminar un registro
    @Delete('/delete/:codAsistencia')
    public async eliminarRegistro(@Param('codAsistencia') codAsistencia: string) {
        const codigo = Number(codAsistencia);
        if (isNaN(codigo)) {
            throw new HttpException('Código de asistencia no válido', HttpStatus.BAD_REQUEST);
        }
        try {
            const resultado = await this.registroasistenciaservice.eliminar(codigo);
            return { mensaje: 'Registro eliminado correctamente', data: resultado };
        } catch (error) {
            throw new HttpException(`Error al eliminar registro: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}