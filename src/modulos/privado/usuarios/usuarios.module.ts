import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuarios } from 'src/models/usuarios/usuarios';
import { Acceso } from 'src/models/acceso/acceso';
import { Fotografias } from 'src/models/fotografias/fotografias';

@Module({
  imports: [TypeOrmModule.forFeature([Usuarios, Acceso, Fotografias])], // ✅ Aquí
  providers: [UsuariosService],
  controllers: [UsuariosController],
  exports: [UsuariosService],
})
export class UsuariosModule {}
