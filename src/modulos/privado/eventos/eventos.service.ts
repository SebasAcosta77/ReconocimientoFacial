import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { Eventos } from 'src/models/eventos/eventos';
import { Usuarios } from 'src/models/usuarios/usuarios';
import { DataSource, LessThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class EventosService {
  private eventosRepository: Repository<Eventos>;
  private usuariosRepository: Repository<Usuarios>;

  constructor(private poolConexion: DataSource) {
    this.eventosRepository = poolConexion.getRepository(Eventos);
    this.usuariosRepository = poolConexion.getRepository(Usuarios);
  }

  //consultar eventos
  public async consultar(): Promise<any> {
    try {
      return this.eventosRepository.find(); //status code 200 traer informacion
    } catch (miError) {
      throw new HttpException(
        'Fallo al consultar el evento',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  //verificar evento
  public async verificarEvento(
    nombre: string,
    codEventoExcluir?: number,
  ): Promise<boolean> {
    try {
      const existe = await this.eventosRepository.find({
        where: {
          nombreEvento: nombre,
        },
      });

      // Si hay coincidencias, verificamos que no sean del mismo evento
      return existe.some((evento) => evento.codEvento !== codEventoExcluir);
    } catch (miError) {
      throw new HttpException(
        'no hay envio de informacion',
        HttpStatus.CONFLICT,
      );
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
      throw new HttpException(
        'Fallo al hacer el registro',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  // consultar un dato
  public async consultarUno(codigo: number): Promise<any> {
    try {
      const evento = await this.eventosRepository.findOne({
        where: { codEvento: codigo },
      });
      if (!evento) {
        throw new HttpException(
          'No se encontró el evento solicitado.',
          HttpStatus.NOT_FOUND,
        );
      }
      return evento;
    } catch (miError) {
      throw new HttpException(
        'Fallo al consultar el evento',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //actualizar
  public async actualizar(objEvento: Eventos, codigo: number): Promise<any> {
    try {
      if (await this.verificarEvento(objEvento.nombreEvento, codigo)) {
        return new HttpException(
          'Ya existe otro evento con ese nombre',
          HttpStatus.BAD_REQUEST,
        );
      }

      const resultado = await this.eventosRepository.update(
        { codEvento: codigo },
        objEvento,
      );

      return {
        mensaje: 'Evento actualizado correctamente',
        affected: resultado.affected,
      };
    } catch (MiError) {
      throw new HttpException(
        'fallo al actualizar objeto',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //eliminar
  public async eliminar(codigo: number): Promise<any> {
    try {
      return this.eventosRepository.delete({ codEvento: codigo });
    } catch (MiError) {
      throw new HttpException(
        'Fallo al eliminar el evento',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
