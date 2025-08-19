import { Injectable, NestMiddleware } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class Seguridad implements NestMiddleware {
    public use(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ respuesta: "Petición negada por el sistema" });
        }

        //  Aceptar token con o sin la palabra 'Bearer' -- importante
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : authHeader;

        try {
            // Verifica el token y recupera los datos
            const datosSesion = verify(token, process.env.JWT_SECRET || 'laClaveSuperSecreta');

            // Guarda los datos del token en la solicitud para usarlos en controladores
            req['datosSesion'] = datosSesion;

            next();
        } catch (error) {
            console.error("Error al verificar el token:", error.message);
            return res.status(401).json({ mensaje: "Intento de fraude" });
        }
    }
}
