import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { compareSync } from 'bcryptjs';
import { Acceso } from 'src/models/acceso/acceso';
import { DataSource, Repository } from 'typeorm';
import { ACCESO_SQL } from '../registro/register_sql';
import GenerarToken from 'src/utilidades/generarToken';

@Injectable()
export class AccessService {
    private accesoRepository : Repository<Acceso>;//crear repositorio

    constructor(private poolConexion:DataSource){
        this.accesoRepository = poolConexion.getRepository(Acceso);//
    }
    public async sesion(objAcceso:Acceso):Promise<any>{
        const usuarioExiste = await this.accesoRepository.findBy({ nombreAcceso: objAcceso.nombreAcceso});

        if (usuarioExiste.length != 0) {
            let claveAcceso = usuarioExiste[0].claveAcceso;
            if (compareSync(objAcceso.claveAcceso, claveAcceso)) {
                try{
                    let datosSesion = await this.accesoRepository.query(ACCESO_SQL.DATOS_SESION, [usuarioExiste[0].codUsuario]);

                    let tokenSistema = GenerarToken.procesarRespuesta(datosSesion[0]);

                    if (tokenSistema != "") {
                        return new HttpException({"tokenApp": tokenSistema},HttpStatus.OK);
                        
                    } else {
                        throw new HttpException("fallo al generar la autenticacion", HttpStatus.CONFLICT);
                        
                    }

                }catch(miError){
                    throw new HttpException("fallo al consultar la informacion", HttpStatus.NOT_ACCEPTABLE);

                }

                
            } else {
                return new HttpException("las claves no coinsiden", HttpStatus.NOT_ACCEPTABLE);
            }
            
        } else {
            return new HttpException("usuario no registrado", HttpStatus.BAD_REQUEST);
            
        }

    }
}
