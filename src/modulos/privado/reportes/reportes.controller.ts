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
import { ReportesService } from './reportes.service';
import { Reportes } from 'src/models/reportes/reportes';
import { Response } from 'express';
import { Res } from '@nestjs/common';

@Controller('/reportes')
export class ReportesController {
  constructor(private readonly reporteService: ReportesService) {}
  @Get('/all') //traer data peticion get
  public obtenerReportes(): any {
    return this.reporteService.consultar();
  }
  //Registrar un reeporte
  @Post('/add')
  public registrarReporte(@Body() objReporte: Reportes): any {
    return this.reporteService.registrar(objReporte);
  }
  //consultar uno
  @Get('/one/:idReporte') //traer data peticion get
  public consultarUnReporte(@Param() parametro: any): any {
    const codigoReporte: number = Number(parametro.idReporte);
    if (!isNaN(codigoReporte)) {
      return this.reporteService.consultarUno(codigoReporte);
    } else {
      return new HttpException(
        'el codigo del reporte no es valido',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
  }
  //actualizar evento
  @Put('/update')
  public actualizarReporte(@Body() objActualizar: Reportes): any {
    return this.reporteService.actualizar(
      objActualizar,
      objActualizar.idReporte,
    );
  }
  //Actalizar reporte por parametros
  @Put('/update/:idReporte')
  public actializarReporteParametro(
    @Body() objActualizar: Reportes,
    @Param() parametros: any,
  ): any {
    const codigo: number = Number(parametros.idReporte);
    if (!isNaN(codigo)) {
      return this.reporteService.actualizar(objActualizar, codigo);
    } else {
      return new HttpException(
        'codigo de evento no valido',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
  }
  //eliminar reporte
  @Delete('/delete/:idReporte') //get y delete no llevan body si no parametros
  public elimiarReporte(@Param() parametros: any): any {
    const codigo: number = Number(parametros.idReporte);
    if (!isNaN(codigo)) {
      return this.reporteService.eliminar(codigo);
    } else {
      return new HttpException(
        'codigo de reporte no valido',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
  }
  //Traer todos los reportes hechos por un usuario específico

  @Get('/usuario/:codUsuario')
  public consultarPorUsuario(@Param('codUsuario') codUsuario: string): any {
    return this.reporteService.consultarPorUsuario(codUsuario);
  }

  //Traer todos los reportes hechos por un evento específico
  @Get('/evento/:codEvento')
  public consultarPorEvento(@Param('codEvento') codEvento: number): any {
    return this.reporteService.consultarPorEvento(codEvento);
  }
  //Traer todos los reportes hechos en una fecha específica

  @Get('/fecha/:fecha')
  public consultarPorFecha(@Param('fecha') fecha: string): any {
    const fechaDate = new Date(fecha);
    if (isNaN(fechaDate.getTime())) {
      return new HttpException('Fecha no válida', HttpStatus.NOT_ACCEPTABLE);
    }
    return this.reporteService.consultarPorFecha(fechaDate);
  }

  // Traer todos los reportes con relaciones y ordenados por fechaReporte de forma descendente.
  @Get('/all/relaciones')
  public consultarTodoConRelaciones(): any {
    return this.reporteService.consultarTodoConRelaciones();
  }

  @Get('/informe/:codEvento')
  public async generarInforme(
    @Param('codEvento') codEvento: number,
    @Res() res: Response,
  ): Promise<void> {
    return this.reporteService.generarInformeEvento(codEvento, res);
  }

  // ✅ Actualizar reporte por código de evento
  @Put('/update/evento/:codEvento')
  public actualizarPorEvento(
    @Param('codEvento') codEvento: number,
    @Body() objActualizar: Partial<Reportes>,
  ): any {
    if (isNaN(codEvento)) {
      throw new HttpException(
        'Código de evento no válido',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    return this.reporteService.actualizarPorEvento(codEvento, objActualizar);
  }

  // Eliminar todos los reportes asociados a un evento
  @Delete('/delete/evento/:codEvento')
  public eliminarReportesPorEvento(@Param('codEvento') codEvento: number): any {
    if (isNaN(codEvento)) {
      throw new HttpException(
        'Código de evento no válido',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    return this.reporteService.eliminarPorEvento(codEvento);
  }
}
