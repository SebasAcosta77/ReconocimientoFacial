import { Body, Controller, Post } from '@nestjs/common';
import { RegistroService } from './registro.service';
import { Acceso } from 'src/models/acceso/acceso';
import { Usuarios } from 'src/models/usuarios/usuarios';

@Controller('/registro')
export class RegistroController {

    constructor(private readonly registerService: RegistroService){

    }
    @Post('/usuario')
    public registrarUsuario(@Body() datosRegistro: any): any{
        const objAcceso: Acceso = datosRegistro;
        const objUsuario: Usuarios = datosRegistro;

        return this.registerService.nuevoUsuario(objAcceso, objUsuario);

    }
}
