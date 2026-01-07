import { Module } from '@nestjs/common';
import { RouterModule, Routes } from '@nestjs/core';
import { EventosModule } from './eventos/eventos.module';
import { ReportesModule } from './reportes/reportes.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RegistroasistenciaModule } from './registroasistencia/registroasistencia.module';
import { FotografiasModule } from './fotografias/fotografias.module';
import { RolModule } from './rol/rol.module';
import { EstadisticasModule  } from './estadisticas/estadisticas.module';

const rutas: Routes = [{
    path: "privado",
    children: [
        EventosModule,
        ReportesModule,
        UsuariosModule,
        RegistroasistenciaModule,
        FotografiasModule,
        RolModule,
        EstadisticasModule



    ]
}]


@Module({
    imports: [EventosModule, RegistroasistenciaModule, ReportesModule, UsuariosModule, FotografiasModule, EstadisticasModule, RouterModule.register(rutas), RolModule]
})
export class PrivadoModule { }
