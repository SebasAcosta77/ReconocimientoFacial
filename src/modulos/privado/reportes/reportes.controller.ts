import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { Reportes } from 'src/models/reportes/reportes';

@Controller('/reportes')
export class ReportesController {
    constructor(private readonly reporteService: ReportesService) {

    }
    @Get("/all")                   //traer data peticion get
    public obtenerReportes(): any {
        return this.reporteService.consultar();
    }
    //Registrar un reeporte
    @Post("/add")
    public registrarReporte(@Body() objReporte: Reportes): any {
        return this.reporteService.registrar(objReporte);
    }
    //consultar uno
    @Get("/one/:idReporte") //traer data peticion get
    public consultarUnReporte(@Param() parametro: any): any {
        const codigoReporte: number = Number(parametro.idReporte);
        if (!isNaN(codigoReporte)) {
            return this.reporteService.consultarUno(codigoReporte);
        } else {
            return new HttpException("el codigo del reporte no es valido", HttpStatus.NOT_ACCEPTABLE);
        }
    }
    //actualizar evento
    @Put("/update")
    public actualizarReporte(@Body() objActualizar: Reportes): any {
        return this.reporteService.actualizar(objActualizar, objActualizar.idReporte);
    }
    //Actalizar reporte por parametros
    @Put("/update/:idReporte")
    public actializarReporteParametro(@Body() objActualizar: Reportes, @Param() parametros: any): any {
        const codigo: number = Number(parametros.idReporte);
        if (!isNaN(codigo)) {
            return this.reporteService.actualizar(objActualizar, codigo);

        } else {
            return new HttpException("codigo de evento no valido", HttpStatus.NOT_ACCEPTABLE);
        }

    }
    //eliminar reporte
    @Delete("/delete/:idReporte")//get y delete no llevan body si no parametros
    public elimiarReporte(@Param() parametros: any): any {
        const codigo: number = Number(parametros.idReporte);
        if (!isNaN(codigo)) {
            return this.reporteService.eliminar(codigo);

        } else {
            return new HttpException("codigo de reporte no valido", HttpStatus.NOT_ACCEPTABLE);
        }
    }
}
