// reportesasistencia.controller.ts
import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReporteAsistenciaService } from './ReporteAsistenciaService';

@Controller('/reporte-asistencia')
export class ReporteAsistenciaController {
  constructor(private readonly reporteService: ReporteAsistenciaService) {}

  @Get('/evento/:codEvento')
  public async descargarReporte(
    @Param('codEvento') codEvento: number,
    @Res() res: Response,
  ): Promise<void> {
    await this.reporteService.generarReportePDF(codEvento, res);
  }
}
