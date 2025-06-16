import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Rol } from 'src/models/rol/rol';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class RolService {
    private rolRepository: Repository<Rol>;

    constructor(private poolConexion: DataSource) {
        this.rolRepository = poolConexion.getRepository(Rol);
    }
    public async consultar(): Promise<any> {
        try {
            return this.rolRepository.find(); //status code 200 traer informacion

        } catch (miError) {
            throw new HttpException('Fallo al consultar el rol', HttpStatus.BAD_REQUEST);

        }
    }
    // taller lunes registrar 1
    public async verificarRol(nombre: string): Promise<boolean> {
        try {
            const existe = await this.rolRepository.findBy({ nombreRol: nombre });
            return existe.length > 0;
        } catch (miError) {
            throw new HttpException('no hay envio de informacion ', HttpStatus.CONFLICT);
        }

    }
    public async registrar(objRol: Rol): Promise<any> {
        try {
            if (await this.verificarRol(objRol.nombreRol)) {
                return new HttpException('El rol ya existe', HttpStatus.BAD_REQUEST);

            } else {
                return await this.rolRepository.save(objRol);

            }

        } catch (MiError) {
            throw new HttpException('Fallo al hacer el registro', HttpStatus.BAD_REQUEST);

        }


    }
    //consultar un dato
    public async consultarUno(codigo: number): Promise<any> {
        try {
            return this.rolRepository.findBy({ codRol: codigo });
        } catch (miError) {
            throw new HttpException('fallo al consultar error', HttpStatus.BAD_REQUEST);

        }
    }
    //actualizar
    public async actualizar(objRol: Rol, codigo: number): Promise<any> {
        try {
            if (await this.verificarRol(objRol.nombreRol)) {
                return new HttpException("El rol ya existe", HttpStatus.BAD_REQUEST)

            } else {
                const objActualizado = this.rolRepository.update({ codRol: codigo }, objRol);
                return new HttpException({ mensaje: "rol actualizado ", objeto: objActualizado }, HttpStatus.OK);

            }

        } catch (MiError) {
            throw new HttpException("fallo al actualizar rol", HttpStatus.BAD_REQUEST)

        }

    }
    //eliminar
    public async eliminar(codigo: number): Promise<any> {
        try {
            return this.rolRepository.delete({ codRol: codigo });

        } catch (MiError) {
            throw new HttpException("Fallo al eliminar el rol", HttpStatus.BAD_REQUEST);

        }
    }

}
