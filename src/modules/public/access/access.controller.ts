import { Body, Controller, Post } from '@nestjs/common';
import { AccessService } from './access.service';
import { Acceso } from 'src/models/acceso/acceso';

@Controller('access')
export class AccessController {
    constructor(private readonly accesoService: AccessService){}

    @Post("signin")
    public inicioSesion(@Body() objAcceso : Acceso): any{
        return this.accesoService.sesion(objAcceso);
    }
}
