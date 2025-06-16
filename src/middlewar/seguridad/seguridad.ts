import { Injectable, NestMiddleware } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';


@Injectable()
export class Seguridad implements NestMiddleware {
    public use(req: Request, res: Response, next: NextFunction) {
        if(!req.headers.authorization){
            res.status(401).json({ respuesta: "peticion negada por el sistema"});

        }else{
            
            try{
                const token = req.headers.authorization;
                const datosSesion = verify(token, 'laClaveSuperSecreta');
                if (req.method != "PUT") {
                    req.body.datosUsuario = datosSesion;
                    
                }
                
                next();

            }catch(miError){
                res.status(401).json({mensaje: "intento de fraude"});
            }
        }
    }

}
