import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { EventosService } from './eventos.service';
import { Eventos } from 'src/models/eventos/eventos';

@Controller('/eventos')
export class EventosController {
  constructor(private readonly eventoservice: EventosService) {}

  @Get('/all') //traer data peticion get
  public obtenerEventos(): any {
    return this.eventoservice.consultar();
  }
  //Registrar un evento
  @Post('/add')
  public registrarEvento(@Body() objEvento: Eventos): any {
    return this.eventoservice.registrar(objEvento);
  }
  //consultar uno
  @Get('/one/:codEvento')
  public consultarUnEvento(@Param('codEvento') codEvento: string): any {
    const codigo = Number(codEvento);
    if (!isNaN(codigo)) {
      return this.eventoservice.consultarUno(codigo);
    }
    throw new HttpException(
      'El código del evento no es válido',
      HttpStatus.NOT_ACCEPTABLE,
    );
  }

  //actualizar evento
  @Put('/update')
  public actualizarEvento(@Body() objActualizar: Eventos): any {
    return this.eventoservice.actualizar(
      objActualizar,
      objActualizar.codEvento,
    );
  }

  //Actalizar evento por parametros
  @Put('/update/:codEvento')
  public actializarEventoParametro(
    @Body() objActualizar: Eventos,
    @Param() parametros: any,
  ): any {
    const codigo: number = Number(parametros.codEvento);
    if (!isNaN(codigo)) {
      return this.eventoservice.actualizar(objActualizar, codigo);
    } else {
      return new HttpException(
        'codigo de evento no valido',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
  }
  //eliminar evento
  @Delete('/delete/:codEvento') //get y delete no llevan body si no parametros
  public elimiarEvento(@Param() parametros: any): any {
    const codigo: number = Number(parametros.codEvento);
    if (!isNaN(codigo)) {
      return this.eventoservice.eliminar(codigo);
    } else {
      return new HttpException(
        'codigo de evento no valido',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
  }
}
