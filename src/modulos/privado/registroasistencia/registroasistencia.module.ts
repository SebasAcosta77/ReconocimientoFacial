import { Module } from '@nestjs/common';
import { RegistroasistenciaService } from './registroasistencia.service';
import { RegistroasistenciaController } from './registroasistencia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registroasistencia } from 'src/models/registroasistencia/registroasistencia';
import { ReporteAsistenciaController } from './ReporteAsistenciaController';
import { ReporteAsistenciaService } from './ReporteAsistenciaService';

@Module({
  imports: [TypeOrmModule.forFeature([Registroasistencia])],
  providers: [RegistroasistenciaService, ReporteAsistenciaService],
  controllers: [RegistroasistenciaController, ReporteAsistenciaController],
})
export class RegistroasistenciaModule {}
