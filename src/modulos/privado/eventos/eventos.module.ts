import { Module } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { EventosController } from './eventos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Eventos } from 'src/models/eventos/eventos';
import { Usuarios } from 'src/models/usuarios/usuarios';

@Module({
  
  providers: [EventosService],
  controllers: [EventosController]
})
export class EventosModule { }
