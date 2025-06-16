import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { PythonService } from './python.service';

@Controller('python')
export class PythonController {
  constructor(private readonly pythonService: PythonService) {}

  // Iniciar el reconocimiento facial
  @Post('start')
  async iniciarReconocimiento(@Body('codEvento') codEvento: number) {
    try {
      if (!codEvento || isNaN(codEvento)) {
        throw new HttpException('El codEvento es requerido y debe ser un número', HttpStatus.BAD_REQUEST);
      }
      return await this.pythonService.iniciarReconocimiento(codEvento);
    } catch (error) {
      throw new HttpException(`Error al iniciar reconocimiento: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Detener el reconocimiento facial
  @Post('stop')
  async detenerReconocimiento() {
    try {
      return await this.pythonService.detenerReconocimiento();
    } catch (error) {
      throw new HttpException(`Error al detener reconocimiento: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}