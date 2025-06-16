import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reportes } from 'src/models/reportes/reportes';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ReportesService {
    private reportesRepository: Repository<Reportes>;

    constructor(private poolConexion: DataSource) {
        this.reportesRepository = poolConexion.getRepository(Reportes);
    }

    //consultar Registro de Asistencia
    public async consultar(): Promise<any> {
        try {
            return this.reportesRepository.find(); //status code 200 traer informacion

        } catch (miError) {
            throw new HttpException('Fallo al consultar el reporte', HttpStatus.BAD_REQUEST);

        }
    }
    //verificar reporte
    public async verificarReporte(descripcion: string): Promise<boolean> {
        try {
            const existe = await this.reportesRepository.findBy({ descripcion: descripcion });
            return existe.length > 0;
        } catch (miError) {
            throw new HttpException('no hay envio de informacion ', HttpStatus.CONFLICT);
        }

    }
    //registrar un evento
    public async registrar(objReporte: Reportes): Promise<any> {
        try {
            if (await this.verificarReporte(objReporte.descripcion)) {
                return new HttpException('El reporte ya existe', HttpStatus.BAD_REQUEST);

            } else {
                return await this.reportesRepository.save(objReporte);

            }

        } catch (MiError) {
            throw new HttpException('Fallo al hacer el reporte', HttpStatus.BAD_REQUEST);

        }


    }
    //consultar un dato
    public async consultarUno(codigo: number): Promise<any> {
        try {
            return this.reportesRepository.findBy({ idReporte: codigo });
        } catch (miError) {
            throw new HttpException('fallo al consultar error', HttpStatus.BAD_REQUEST);

        }
    }
    //actualizar
    public async actualizar(objReporte: Reportes, codigo: number): Promise<any> {
        try {
            if (await this.verificarReporte(objReporte.descripcion)) {
                return new HttpException("El reporte ya existe ya existe", HttpStatus.BAD_REQUEST)

            } else {
                const objActualizado = this.reportesRepository.update({ idReporte: codigo }, objReporte);
                return new HttpException({ mensaje: "reporte actualizado ", objeto: objActualizado }, HttpStatus.OK);

            }

        } catch (MiError) {
            throw new HttpException("fallo al actualizar objeto", HttpStatus.BAD_REQUEST)

        }

    }
    //eliminar
    public async eliminar(codigo: number): Promise<any> {
        try {
            return this.reportesRepository.delete({ idReporte: codigo });

        } catch (MiError) {
            throw new HttpException("Fallo al eliminar el reporte", HttpStatus.BAD_REQUEST);

        }
    }


}
