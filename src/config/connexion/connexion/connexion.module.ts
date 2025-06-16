import { Global, Module } from '@nestjs/common';
import { Acceso } from 'src/models/acceso/acceso';
import { Eventos } from 'src/models/eventos/eventos';
import { Fotografias } from 'src/models/fotografias/fotografias';
import { Registroasistencia } from 'src/models/registroasistencia/registroasistencia';
import { Reportes } from 'src/models/reportes/reportes';
import { Rol } from 'src/models/rol/rol';
import { Usuarios } from 'src/models/usuarios/usuarios';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Global()
@Module({
    imports:[],
    providers:[

        {provide: DataSource,
            inject:[],
            useFactory:async ()=>{
                try{
                    const poolConexion = new DataSource({
                     type:"postgres",
                     host:String(process.env.HOST),
                     port:Number(process.env.PORT),
                     username:String(process.env.USER),
                     password:String(process.env.PASSWORD),
                     database:String(process.env.DATA_BASE),
                     synchronize:true, //sincronza la bd
                     logging:true,//muestra o oculta la bd
                     namingStrategy: new SnakeNamingStrategy(),
                     entities:[Eventos, Usuarios, Fotografias, Reportes, Registroasistencia, Rol, Acceso ],//aqui se colocan las entidades que se van a utilizar
                    });
                    await poolConexion.initialize();
                    console.log("conexion establecida con: "+ String(process.env.DATA_BASE));
                    return poolConexion;
                }catch(miErrorsito){
                    console.log("fallo al realizar la conexion con la bd");
                    throw miErrorsito;
                }
            }
        }
    ],
    exports:[DataSource],
})
export class ConnexionModule {}
