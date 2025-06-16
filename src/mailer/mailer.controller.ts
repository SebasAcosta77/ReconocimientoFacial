import { Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { MailService } from './mailer.service';

@Controller('mailer')
export class MailerController {
    constructor(private mailService: MailService) {}

    @Post('send')
    async sendNotifications() {
        try {
            await this.mailService.sendEventEndNotifications();
            return { message: 'Notificaciones enviadas con éxito' };
        } catch (error) {
            throw new HttpException(`Error al enviar notificaciones: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
