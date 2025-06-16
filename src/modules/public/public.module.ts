import { Module } from '@nestjs/common';
import { AccessModule } from './access/access.module';
import { RouterModule, Routes } from '@nestjs/core';
import { RegistroModule } from './registro/registro.module';

const ruta: Routes =[
    {
        path:"public",
        children:[
            AccessModule,
            RegistroModule
        ]
    }
]

@Module({
    imports:[AccessModule, RegistroModule, RouterModule.register(ruta)],
    exports:[RouterModule]
})
export class PublicModule {}
