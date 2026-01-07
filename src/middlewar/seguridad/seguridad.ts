import { Injectable, NestMiddleware } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class Seguridad implements NestMiddleware {
  public use(req: Request, res: Response, next: NextFunction) {
    // 1️⃣ Verificar si el token viene en el header o en la query (?token=)
    let authHeader = req.headers.authorization;

    if (!authHeader && req.query.token) {
      authHeader = `Bearer ${req.query.token}`;
    }

    // 2️⃣ Si no hay token en ninguna parte → rechazar
    if (!authHeader) {
      return res.status(401).json({ respuesta: 'Petición negada por el sistema' });
    }

    // 3️⃣ Extraer el token (con o sin prefijo 'Bearer ')
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    try {
      // 4️⃣ Verificar y decodificar token
      const datosSesion = verify(token, process.env.JWT_SECRET || 'laClaveSuperSecreta');

      // 5️⃣ Guardar datos en la request (para usarlos en controladores)
      req['datosSesion'] = datosSesion;

      next();
    } catch (error) {
      console.error('Error al verificar el token:', (error as Error).message);
      return res.status(401).json({ mensaje: 'Intento de fraude' });
    }
  }
}
