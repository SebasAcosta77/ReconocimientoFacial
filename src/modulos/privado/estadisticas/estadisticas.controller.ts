import { Controller, Get } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';

@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('generales')
  async obtenerGenerales() {
    return this.estadisticasService.obtenerEstadisticasGenerales();
  }
  @Get('eventos-tipo')
  async obtenerEventosPorTipo() {
    return this.estadisticasService.obtenerEventosPorTipo();
  }
}
