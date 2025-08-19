import { Controller, Post, Body } from '@nestjs/common';
import { decode } from 'jsonwebtoken';

@Controller('token')
export class TokenController {
    @Post('decode')
    public decodificarToken(@Body() body: { token: string }) {
        const datos = decode(body.token);
        return {
            contenido: datos || 'Token inválido o mal formado'
        };
    }
}
