import { Module } from '@nestjs/common';
import { RegistroasistenciaService } from './registroasistencia.service';
import { RegistroasistenciaController } from './registroasistencia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registroasistencia } from 'src/models/registroasistencia/registroasistencia';

@Module({
  imports: [TypeOrmModule.forFeature([Registroasistencia])],
  providers: [RegistroasistenciaService],
  controllers: [RegistroasistenciaController]
})
export class RegistroasistenciaModule {}
