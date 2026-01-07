import { Module } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { EstadisticasController } from './estadisticas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuarios } from 'src/models/usuarios/usuarios';
import { Eventos } from 'src/models/eventos/eventos';
import { Registroasistencia } from 'src/models/registroasistencia/registroasistencia';

@Module({
  imports: [TypeOrmModule.forFeature([Usuarios, Eventos, Registroasistencia])],  
  controllers: [EstadisticasController],
  providers: [EstadisticasService],
})
export class EstadisticasModule {}
