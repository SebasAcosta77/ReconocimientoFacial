import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { Eventos } from 'src/models/eventos/eventos';
import { Usuarios } from 'src/models/usuarios/usuarios';
import { DataSource, LessThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class EventosService {
    private eventosRepository: Repository<Eventos>;
    private usuariosRepository: Repository<Usuarios>;
  

    constructor(
        private poolConexion: DataSource,
        
    ) {
        this.eventosRepository = poolConexion.getRepository(Eventos);
        this.usuariosRepository = poolConexion.getRepository(Usuarios);
        
    }

    //consultar eventos
    public async consultar(): Promise<any> {
        try {
            return this.eventosRepository.find(); //status code 200 traer informacion

        } catch (miError) {
            throw new HttpException('Fallo al consultar el evento', HttpStatus.BAD_REQUEST);

        }
    }
    //verificar evento
    public async verificarEvento(nombre: string): Promise<boolean> {
        try {
            const existe = await this.eventosRepository.findBy({ nombreEvento: nombre });
            return existe.length > 0;
        } catch (miError) {
            throw new HttpException('no hay envio de informacion ', HttpStatus.CONFLICT);
        }

    }
    //registrar un evento
    public async registrar(objEvento: Eventos): Promise<any> {
        try {
            if (await this.verificarEvento(objEvento.nombreEvento)) {
                return new HttpException('El evento ya existe', HttpStatus.BAD_REQUEST);

            } else {
                return await this.eventosRepository.save(objEvento);

            }

        } catch (MiError) {
            throw new HttpException('Fallo al hacer el registro', HttpStatus.BAD_REQUEST);

        }


    }
    //consultar un dato
    public async consultarUno(codigo: number): Promise<any> {
        try {
            return this.eventosRepository.findBy({ codEvento: codigo });
        } catch (miError) {
            throw new HttpException('fallo al consultar error', HttpStatus.BAD_REQUEST);

        }
    }
    //actualizar
    public async actualizar(objEvento: Eventos, codigo: number): Promise<any> {
        try {
            if (await this.verificarEvento(objEvento.nombreEvento)) {
                return new HttpException("El evento ya existe ya existe", HttpStatus.BAD_REQUEST)

            } else {
                const objActualizado = this.eventosRepository.update({ codEvento: codigo }, objEvento);
                return new HttpException({ mensaje: "evento actualizado ", objeto: objActualizado }, HttpStatus.OK);

            }

        } catch (MiError) {
            throw new HttpException("fallo al actualizar objeto", HttpStatus.BAD_REQUEST)

        }

    }
    //eliminar
    public async eliminar(codigo: number): Promise<any> {
        try {
            return this.eventosRepository.delete({ codEvento: codigo });

        } catch (MiError) {
            throw new HttpException("Fallo al eliminar el evento", HttpStatus.BAD_REQUEST);

        }
    }
    
}
