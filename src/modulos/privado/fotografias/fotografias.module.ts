import { Module } from '@nestjs/common';
import { FotografiasService } from './fotografias.service';
import { FotografiasController } from './fotografias.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [UsuariosModule], // Necesario para verificar codUsuario
  providers: [FotografiasService],
  controllers: [FotografiasController]
})
export class FotografiasModule {}
