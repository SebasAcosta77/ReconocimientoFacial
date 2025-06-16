import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { RolService } from './rol.service';
import { Rol } from 'src/models/rol/rol';

@Controller('/rol')
export class RolController {
    constructor(private readonly rolService: RolService) { }
    //condultar todos los roles
    @Get("/all")                   //traer data peticion get
    public obtenerRoles(): any {
        return this.rolService.consultar();
    }
    //Registrar un rol
    @Post("/add")
    public registrarRol(@Body() objRol: Rol): any {
        return this.rolService.registrar(objRol);
    }
    //consultar uno
    @Get("/one/:codRol")
    public consultarUnrol(@Param() parametro: any): any {
        const codigoRol: number = Number(parametro.codRol);
        if (!isNaN(codigoRol)) {
            return this.rolService.consultarUno(codigoRol);
        } else {
            return new HttpException("el codigo del rol no es valido", HttpStatus.NOT_ACCEPTABLE);
        }
    }
    //actualizar rol
    @Put("/update")
    public actualizarRol(@Body() objActualizar: Rol): any {
        return this.rolService.actualizar(objActualizar, objActualizar.codRol);
    }
    //Actalizar rol por parametros
    @Put("/update/:codRol")
    public actializarRolParametro(@Body() objActualizar: Rol, @Param() parametros: any): any {
        const codigo: number = Number(parametros.codRol);
        if (!isNaN(codigo)) {
            return this.rolService.actualizar(objActualizar, codigo);

        } else {
            return new HttpException("codigo de rol no valido", HttpStatus.NOT_ACCEPTABLE);
        }

    }
    //eliminar rol
    @Delete("/delete/:codRol")//get y delete no llevan body si no parametros
    public elimiarRol(@Param() parametros: any): any {
        const codigo: number = Number(parametros.codRol);
        if (!isNaN(codigo)) {
            return this.rolService.eliminar(codigo);

        } else {
            return new HttpException("codigo de rol no valido", HttpStatus.NOT_ACCEPTABLE);
        }
    }
}
