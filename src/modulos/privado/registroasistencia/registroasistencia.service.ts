import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Registroasistencia } from 'src/models/registroasistencia/registroasistencia';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class RegistroasistenciaService {
    private registroAsistenciaRepository: Repository<Registroasistencia>;

    constructor(private poolConexion: DataSource) {
        this.registroAsistenciaRepository = poolConexion.getRepository(Registroasistencia);
    }

    // Consultar todos los registros de asistencia
    public async consultar(): Promise<Registroasistencia[]> {
        try {
            const registros = await this.registroAsistenciaRepository.find();
            return registros.length ? registros : [];
        } catch (error) {
            throw new HttpException(`Fallo al consultar registros: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    // Verificar si existe un registro
    public async verificarRegistroAsistencia(cod: number): Promise<boolean> {
        try {
            const existe = await this.registroAsistenciaRepository.findOneBy({ codAsistencia: cod });
            return !!existe;
        } catch (error) {
            throw new HttpException(`Error al verificar registro con codAsistencia ${cod}`, HttpStatus.CONFLICT);
        }
    }

    // Registrar un nuevo registro de asistencia (para el servicio en Python)
    public async registrar(objRegistro: Registroasistencia): Promise<Registroasistencia> {
        try {
            // Verifica si ya existe un registro para ese usuario en ese evento
            const yaRegistrado = await this.registroAsistenciaRepository.findOne({
                where: {
                    codUsuario: objRegistro.codUsuario,
                    codEvento: objRegistro.codEvento,
                },
            });

            if (yaRegistrado) {
                throw new HttpException(
                    `El usuario ${objRegistro.codUsuario} ya tiene un registro para el evento ${objRegistro.codEvento}`,
                    HttpStatus.BAD_REQUEST
                );
            }

            // Usar horaEntrada del payload, convertir a Date si es string
            if (typeof objRegistro.horaEntrada === 'string') {
                objRegistro.horaEntrada = new Date(objRegistro.horaEntrada);
            } else if (!objRegistro.horaEntrada) {
                objRegistro.horaEntrada = new Date(); // Fallback si no se envía
            }

            // Asegurar que estadoValidacion y observacionesAsistencia estén definidos
            objRegistro.estadoValidacion = objRegistro.estadoValidacion ?? false;
            objRegistro.observacionesAsistencia = objRegistro.observacionesAsistencia || 'Sin observaciones';

            return await this.registroAsistenciaRepository.save(objRegistro);
        } catch (error) {
            throw new HttpException(`Fallo al registrar asistencia: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    // Consultar un registro por codAsistencia
    public async consultarUno(codigo: number): Promise<Registroasistencia[]> {
        try {
            const registros = await this.registroAsistenciaRepository.findBy({ codAsistencia: codigo });
            return registros.length ? registros : [];
        } catch (error) {
            throw new HttpException(`Fallo al consultar registro con codAsistencia ${codigo}`, HttpStatus.BAD_REQUEST);
        }
    }

    // Actualizar un registro
    public async actualizar(objAsistencia: Registroasistencia, codigo: number): Promise<any> {
        try {
            const existe = await this.verificarRegistroAsistencia(codigo);
            if (!existe) {
                throw new HttpException(`No existe un registro con codAsistencia ${codigo}`, HttpStatus.NOT_FOUND);
            }

            const resultado = await this.registroAsistenciaRepository.update({ codAsistencia: codigo }, objAsistencia);
            if (resultado.affected === 0) {
                throw new HttpException(`No se pudo actualizar el registro con codAsistencia ${codigo}`, HttpStatus.BAD_REQUEST);
            }

            return { mensaje: 'Registro actualizado correctamente', data: objAsistencia };
        } catch (error) {
            throw new HttpException(`Fallo al actualizar registro con codAsistencia ${codigo}: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    // Eliminar un registro
    public async eliminar(codigo: number): Promise<any> {
        try {
            const resultado = await this.registroAsistenciaRepository.delete({ codAsistencia: codigo });
            if (resultado.affected === 0) {
                throw new HttpException(`No existe un registro con codAsistencia ${codigo}`, HttpStatus.NOT_FOUND);
            }
            return { mensaje: 'Registro eliminado correctamente' };
        } catch (error) {
            throw new HttpException(`Fallo al eliminar registro con codAsistencia ${codigo}: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }
}